from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import time
import logging
import bcrypt
import jwt
import cloudinary
import cloudinary.utils
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"
ACCESS_TOKEN_EXP_DAYS = 7

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

cloudinary.config(
    cloud_name=os.environ['CLOUDINARY_CLOUD_NAME'],
    api_key=os.environ['CLOUDINARY_API_KEY'],
    api_secret=os.environ['CLOUDINARY_API_SECRET'],
    secure=True,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("myway")

app = FastAPI(title="MyWay API")
api = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)


# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------
class RegisterPayload(BaseModel):
    first_name: str
    last_name: str
    country: str
    school: str
    language: str
    email: EmailStr
    password: str = Field(min_length=6)


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    first_name: str
    last_name: str
    country: str
    school: str
    language: str
    email: EmailStr
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    interests: List[str] = []
    created_at: str


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    country: Optional[str] = None
    school: Optional[str] = None
    language: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    photo_url: Optional[str] = None


class EventModel(BaseModel):
    id: str
    title: str
    description: str
    date: str
    location: str
    category: str
    image_url: str
    participants: List[str] = []
    recommended: bool = False


class InfoCategory(BaseModel):
    id: str
    slug: str
    icon: str
    title: str
    short_description: str
    content: str


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def hash_password(pwd: str) -> str:
    return bcrypt.hashpw(pwd.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pwd: str, pwd_hash: str) -> bool:
    return bcrypt.checkpw(pwd.encode("utf-8"), pwd_hash.encode("utf-8"))


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXP_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def user_to_public(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "first_name": doc["first_name"],
        "last_name": doc["last_name"],
        "country": doc["country"],
        "school": doc["school"],
        "language": doc["language"],
        "email": doc["email"],
        "photo_url": doc.get("photo_url"),
        "bio": doc.get("bio"),
        "interests": doc.get("interests", []),
        "created_at": doc["created_at"],
    }


async def get_current_user(
    request: Request,
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
) -> dict:
    token = None
    if creds and creds.scheme.lower() == "bearer":
        token = creds.credentials
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.lower().startswith("bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expirée")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    return user


# -----------------------------------------------------------------------------
# Auth endpoints
# -----------------------------------------------------------------------------
@api.post("/auth/register", response_model=AuthResponse)
async def register(payload: RegisterPayload):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "first_name": payload.first_name.strip(),
        "last_name": payload.last_name.strip(),
        "country": payload.country.strip(),
        "school": payload.school.strip(),
        "language": payload.language.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "photo_url": None,
        "bio": None,
        "interests": [],
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, email)
    return {"token": token, "user": user_to_public(doc)}


@api.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginPayload):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    token = create_token(user["id"], email)
    return {"token": token, "user": user_to_public(user)}


@api.get("/auth/me", response_model=UserPublic)
async def me(current=Depends(get_current_user)):
    return user_to_public(current)


# -----------------------------------------------------------------------------
# Profile
# -----------------------------------------------------------------------------
@api.put("/profile", response_model=UserPublic)
async def update_profile(update: ProfileUpdate, current=Depends(get_current_user)):
    patch = {k: v for k, v in update.model_dump().items() if v is not None}
    if patch:
        await db.users.update_one({"id": current["id"]}, {"$set": patch})
    user = await db.users.find_one({"id": current["id"]}, {"_id": 0})
    return user_to_public(user)


# -----------------------------------------------------------------------------
# Students (matching)
# -----------------------------------------------------------------------------
@api.get("/students", response_model=List[UserPublic])
async def list_students(
    current=Depends(get_current_user),
    country: Optional[str] = None,
    school: Optional[str] = None,
    language: Optional[str] = None,
    interest: Optional[str] = None,
    q: Optional[str] = None,
):
    query: dict = {"id": {"$ne": current["id"]}, "role": {"$ne": "admin"}}
    if country:
        query["country"] = country
    if school:
        query["school"] = school
    if language:
        query["language"] = language
    if interest:
        query["interests"] = interest
    if q:
        query["$or"] = [
            {"first_name": {"$regex": q, "$options": "i"}},
            {"last_name": {"$regex": q, "$options": "i"}},
            {"school": {"$regex": q, "$options": "i"}},
        ]
    cursor = db.users.find(query, {"_id": 0, "password_hash": 0}).limit(200)
    results = await cursor.to_list(200)
    return [user_to_public(u) for u in results]


@api.get("/students/filters")
async def student_filters():
    countries = await db.users.distinct("country", {"role": {"$ne": "admin"}})
    schools = await db.users.distinct("school", {"role": {"$ne": "admin"}})
    languages = await db.users.distinct("language", {"role": {"$ne": "admin"}})
    interests = await db.users.distinct("interests", {"role": {"$ne": "admin"}})
    return {
        "countries": sorted([c for c in countries if c]),
        "schools": sorted([s for s in schools if s]),
        "languages": sorted([lang for lang in languages if lang]),
        "interests": sorted([i for i in interests if i]),
    }


# -----------------------------------------------------------------------------
# Info categories
# -----------------------------------------------------------------------------
@api.get("/infos", response_model=List[InfoCategory])
async def list_infos():
    cursor = db.infos.find({}, {"_id": 0})
    return await cursor.to_list(50)


@api.get("/infos/{slug}", response_model=InfoCategory)
async def get_info(slug: str):
    info = await db.infos.find_one({"slug": slug}, {"_id": 0})
    if not info:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    return info


# -----------------------------------------------------------------------------
# Events
# -----------------------------------------------------------------------------
@api.get("/events", response_model=List[EventModel])
async def list_events():
    cursor = db.events.find({}, {"_id": 0}).sort("date", 1)
    return await cursor.to_list(200)


@api.get("/events/recommended", response_model=List[EventModel])
async def recommended_events(current=Depends(get_current_user)):
    cursor = db.events.find({"recommended": True}, {"_id": 0}).limit(6)
    return await cursor.to_list(6)


@api.post("/events/{event_id}/participate")
async def participate(event_id: str, current=Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Événement introuvable")
    participants = event.get("participants", [])
    if current["id"] in participants:
        await db.events.update_one(
            {"id": event_id}, {"$pull": {"participants": current["id"]}}
        )
        return {"participating": False}
    await db.events.update_one(
        {"id": event_id}, {"$addToSet": {"participants": current["id"]}}
    )
    return {"participating": True}


# -----------------------------------------------------------------------------
# Cloudinary
# -----------------------------------------------------------------------------
@api.get("/cloudinary/signature")
def cloudinary_signature(
    folder: str = Query("users/avatars"),
    current=Depends(get_current_user),
):
    if not folder.startswith(("users/", "uploads/")):
        raise HTTPException(status_code=400, detail="Dossier non autorisé")
    timestamp = int(time.time())
    params = {
        "timestamp": timestamp,
        "folder": folder,
        "upload_preset": os.environ.get("CLOUDINARY_UPLOAD_PRESET", ""),
    }
    # Remove empty values before signing
    params = {k: v for k, v in params.items() if v not in (None, "")}
    signature = cloudinary.utils.api_sign_request(
        params, os.environ["CLOUDINARY_API_SECRET"]
    )
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": os.environ["CLOUDINARY_CLOUD_NAME"],
        "api_key": os.environ["CLOUDINARY_API_KEY"],
        "folder": folder,
        "upload_preset": os.environ.get("CLOUDINARY_UPLOAD_PRESET", ""),
    }


@api.get("/health")
async def health():
    return {"ok": True, "service": "myway", "time": datetime.now(timezone.utc).isoformat()}


# -----------------------------------------------------------------------------
# Seed data
# -----------------------------------------------------------------------------
INFO_CATEGORIES = [
    {
        "slug": "demarches",
        "icon": "Bank",
        "title": "Démarches administratives",
        "short_description": "Titre de séjour, CAF, compte bancaire — toutes les étapes essentielles.",
        "content": (
            "Dès ton arrivée en France, plusieurs démarches doivent être accomplies. "
            "Demande ton titre de séjour étudiant auprès de la préfecture dans les 3 mois, "
            "ouvre un compte bancaire (pièces requises : passeport, attestation d'école, "
            "justificatif de domicile), inscris-toi à la CAF pour l'aide au logement (APL), "
            "et pense à la Sécurité sociale étudiante sur etudiant-etranger.ameli.fr."
        ),
    },
    {
        "slug": "logement",
        "icon": "House",
        "title": "Logement",
        "short_description": "CROUS, colocation, résidences étudiantes et garant Visale.",
        "content": (
            "Trouver un logement est la priorité. Explore les résidences CROUS "
            "(messervices.etudiant.gouv.fr), les résidences privées étudiantes, "
            "la colocation sur Leboncoin ou Appartager, et n'oublie pas la garantie Visale "
            "(gratuite, fournie par Action Logement) qui remplace un garant en France."
        ),
    },
    {
        "slug": "sante",
        "icon": "Heartbeat",
        "title": "Santé",
        "short_description": "Sécurité sociale, mutuelle étudiante et médecin traitant.",
        "content": (
            "Tous les étudiants étrangers sont affiliés gratuitement à la Sécurité sociale. "
            "Inscris-toi sur etudiant-etranger.ameli.fr. Pense à souscrire une mutuelle "
            "complémentaire (LMDE, Heyme). Déclare un médecin traitant pour être mieux "
            "remboursé, et garde en mémoire le 15 (SAMU) en cas d'urgence."
        ),
    },
    {
        "slug": "transport",
        "icon": "Train",
        "title": "Transport",
        "short_description": "Pass Navigo, carte Avantage SNCF et vélos en libre service.",
        "content": (
            "Le Pass Navigo Imagine R est tarifé à environ 380€/an pour les moins de 26 ans "
            "en Île-de-France. La carte Avantage Jeune SNCF (49€/an) offre -30% sur les TGV. "
            "Explore aussi Vélib', Lime et le covoiturage avec BlaBlaCar pour voyager moins cher."
        ),
    },
    {
        "slug": "vie-etudiante",
        "icon": "Coffee",
        "title": "Vie étudiante",
        "short_description": "Associations, sport, culture et bons plans du quotidien.",
        "content": (
            "Profite à fond de la vie étudiante ! Rejoins les associations (BDE), inscris-toi "
            "aux activités sportives universitaires (SUAPS), demande le Pass Culture (300€ "
            "à 18 ans), et profite des réductions cinéma, musées gratuits pour les moins de 26 ans "
            "ressortissants de l'UE, et des repas à 1€ au CROUS pour les boursiers."
        ),
    },
]


SEED_STUDENTS = [
    {
        "first_name": "Amina",
        "last_name": "Traoré",
        "country": "Sénégal",
        "school": "Sorbonne Université",
        "language": "Français",
        "email": "amina.traore@myway.fr",
        "bio": "Passionnée par la sociologie et la musique afro.",
        "interests": ["Musique", "Lecture", "Cinéma"],
        "photo_url": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
    },
    {
        "first_name": "Kenji",
        "last_name": "Tanaka",
        "country": "Japon",
        "school": "Sciences Po Paris",
        "language": "Japonais",
        "email": "kenji.tanaka@myway.fr",
        "bio": "Étudiant en relations internationales, fan de gastronomie.",
        "interests": ["Cuisine", "Voyage", "Photographie"],
        "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    {
        "first_name": "Sofia",
        "last_name": "García",
        "country": "Espagne",
        "school": "HEC Paris",
        "language": "Espagnol",
        "email": "sofia.garcia@myway.fr",
        "bio": "Business & entrepreneuriat, toujours partante pour un café.",
        "interests": ["Business", "Sport", "Voyage"],
        "photo_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    },
    {
        "first_name": "Luca",
        "last_name": "Rossi",
        "country": "Italie",
        "school": "ESSEC",
        "language": "Italien",
        "email": "luca.rossi@myway.fr",
        "bio": "Amateur d'art, de football et de bonne pizza.",
        "interests": ["Sport", "Art", "Cinéma"],
        "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    },
    {
        "first_name": "Priya",
        "last_name": "Sharma",
        "country": "Inde",
        "school": "Sorbonne Université",
        "language": "Anglais",
        "email": "priya.sharma@myway.fr",
        "bio": "Étudiante en informatique, curieuse de la culture française.",
        "interests": ["Tech", "Lecture", "Voyage"],
        "photo_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    },
    {
        "first_name": "Mateus",
        "last_name": "Silva",
        "country": "Brésil",
        "school": "Université Paris-Dauphine",
        "language": "Portugais",
        "email": "mateus.silva@myway.fr",
        "bio": "Fan de samba, de foot et de maths appliquées.",
        "interests": ["Musique", "Sport", "Danse"],
        "photo_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400",
    },
    {
        "first_name": "Chen",
        "last_name": "Wei",
        "country": "Chine",
        "school": "École Polytechnique",
        "language": "Chinois",
        "email": "chen.wei@myway.fr",
        "bio": "Ingénierie & IA, j'apprends le français avec humour.",
        "interests": ["Tech", "Jeux vidéo", "Cuisine"],
        "photo_url": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400",
    },
    {
        "first_name": "Layla",
        "last_name": "Haddad",
        "country": "Maroc",
        "school": "Sciences Po Paris",
        "language": "Arabe",
        "email": "layla.haddad@myway.fr",
        "bio": "Droit international, j'adore les musées parisiens.",
        "interests": ["Art", "Lecture", "Cinéma"],
        "photo_url": "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400",
    },
    {
        "first_name": "Ethan",
        "last_name": "Brown",
        "country": "États-Unis",
        "school": "HEC Paris",
        "language": "Anglais",
        "email": "ethan.brown@myway.fr",
        "bio": "MBA, runner, et toujours en quête de bons plans food.",
        "interests": ["Sport", "Business", "Cuisine"],
        "photo_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    },
    {
        "first_name": "Aïcha",
        "last_name": "Diallo",
        "country": "Côte d'Ivoire",
        "school": "Université Paris-Dauphine",
        "language": "Français",
        "email": "aicha.diallo@myway.fr",
        "bio": "Finance & danse, je veux créer ma startup un jour.",
        "interests": ["Business", "Danse", "Mode"],
        "photo_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
    },
]


SEED_EVENTS = [
    {
        "title": "Soirée d'accueil internationale",
        "description": "Rencontre les autres étudiants étrangers autour d'un verre et de musique du monde.",
        "date": "2026-03-15T19:00:00",
        "location": "Campus Sorbonne, Paris 5e",
        "category": "Social",
        "image_url": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
        "recommended": True,
    },
    {
        "title": "Atelier démarches préfecture",
        "description": "Tout ce qu'il faut savoir pour obtenir ton titre de séjour étudiant.",
        "date": "2026-03-22T14:00:00",
        "location": "Maison des étudiants, Paris 13e",
        "category": "Pratique",
        "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
        "recommended": True,
    },
    {
        "title": "Visite guidée Montmartre",
        "description": "Découvre le Montmartre des artistes avec un guide étudiant passionné.",
        "date": "2026-03-29T10:00:00",
        "location": "Place du Tertre, Paris 18e",
        "category": "Culture",
        "image_url": "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800",
        "recommended": True,
    },
    {
        "title": "Tournoi de football inter-écoles",
        "description": "Viens représenter ton école lors de notre tournoi amical annuel.",
        "date": "2026-04-05T13:00:00",
        "location": "Stade Charléty, Paris 13e",
        "category": "Sport",
        "image_url": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800",
        "recommended": False,
    },
    {
        "title": "Cours de cuisine française",
        "description": "Apprends à réaliser un menu complet : entrée, plat, dessert.",
        "date": "2026-04-12T11:00:00",
        "location": "L'atelier des Chefs, Paris 2e",
        "category": "Culture",
        "image_url": "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800",
        "recommended": True,
    },
    {
        "title": "Afterwork networking",
        "description": "Rencontre des professionnels et d'autres étudiants dans un cadre décontracté.",
        "date": "2026-04-18T18:30:00",
        "location": "Rooftop du Perchoir, Paris 11e",
        "category": "Pro",
        "image_url": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
        "recommended": False,
    },
    {
        "title": "Journée bien-être & yoga",
        "description": "Détends-toi avec une séance de yoga suivie d'un brunch sain.",
        "date": "2026-04-26T09:30:00",
        "location": "Jardin du Luxembourg, Paris 6e",
        "category": "Santé",
        "image_url": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800",
        "recommended": False,
    },
    {
        "title": "Excursion Château de Versailles",
        "description": "Une journée royale à Versailles, transport et guide inclus.",
        "date": "2026-05-03T08:00:00",
        "location": "Versailles (RER C)",
        "category": "Culture",
        "image_url": "https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=800",
        "recommended": True,
    },
]


@app.on_event("startup")
async def startup():
    # Indexes
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        await db.events.create_index("id", unique=True)
        await db.infos.create_index("slug", unique=True)
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")

    # Admin seed
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@myway.fr")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@Myway2025")
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "first_name": "Admin",
            "last_name": "MyWay",
            "country": "France",
            "school": "MyWay",
            "language": "Français",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "photo_url": None,
            "bio": "Administrateur de la plateforme.",
            "interests": [],
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin user seeded")
    else:
        if not verify_password(admin_password, existing_admin["password_hash"]):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password)}},
            )

    # Students seed
    student_count = await db.users.count_documents({"role": "user"})
    if student_count < len(SEED_STUDENTS):
        for s in SEED_STUDENTS:
            exists = await db.users.find_one({"email": s["email"]})
            if exists:
                continue
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                **s,
                "password_hash": hash_password("Demo@2025"),
                "role": "user",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        logger.info("Students seeded")

    # Info seed
    info_count = await db.infos.count_documents({})
    if info_count == 0:
        for i in INFO_CATEGORIES:
            await db.infos.insert_one({"id": str(uuid.uuid4()), **i})
        logger.info("Info categories seeded")

    # Events seed
    events_count = await db.events.count_documents({})
    if events_count == 0:
        for e in SEED_EVENTS:
            await db.events.insert_one({
                "id": str(uuid.uuid4()),
                "participants": [],
                **e,
            })
        logger.info("Events seeded")


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
