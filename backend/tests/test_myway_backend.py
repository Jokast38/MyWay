"""Backend API tests for MyWay platform."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://myway-integration.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@myway.fr"
ADMIN_PASSWORD = "Admin@Myway2025"
SEED_STUDENT_EMAIL = "amina.traore@myway.fr"
SEED_STUDENT_PASSWORD = "Demo@2025"


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def student_token():
    r = requests.post(f"{API}/auth/login", json={"email": SEED_STUDENT_EMAIL, "password": SEED_STUDENT_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Seed student login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def new_user():
    email = f"test_{uuid.uuid4().hex[:10]}@myway.fr"
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "country": "Allemagne",
        "school": "Sorbonne Université",
        "language": "Allemand",
        "email": email,
        "password": "Testpass123!",
    }
    r = requests.post(f"{API}/auth/register", json=payload, timeout=15)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    return {"email": email, "token": data["token"], "user": data["user"], "password": payload["password"]}


# ---------- Health ----------
def test_health():
    r = requests.get(f"{API}/health", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert data["service"] == "myway"


# ---------- Auth ----------
def test_register_returns_token_and_user(new_user):
    assert isinstance(new_user["token"], str) and len(new_user["token"]) > 20
    assert new_user["user"]["email"] == new_user["email"]
    assert new_user["user"]["first_name"] == "Test"
    assert "id" in new_user["user"]


def test_register_duplicate_email_fails(new_user):
    r = requests.post(f"{API}/auth/register", json={
        "first_name": "Dup", "last_name": "User", "country": "X", "school": "Y",
        "language": "Z", "email": new_user["email"], "password": "Testpass123!"
    }, timeout=15)
    assert r.status_code == 400


def test_login_admin(admin_token):
    assert isinstance(admin_token, str) and len(admin_token) > 20


def test_login_invalid_password():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
    assert r.status_code == 401


def test_auth_me_requires_bearer(admin_token):
    r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN_EMAIL


def test_auth_me_unauthorized():
    r = requests.get(f"{API}/auth/me", timeout=15)
    assert r.status_code == 401


# ---------- Profile ----------
def test_profile_update_and_persistence(new_user):
    headers = {"Authorization": f"Bearer {new_user['token']}"}
    r = requests.put(f"{API}/profile", json={"bio": "Nouvelle bio test", "interests": ["Sport", "Musique"]}, headers=headers, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["bio"] == "Nouvelle bio test"
    assert set(data["interests"]) == {"Sport", "Musique"}

    # Verify via GET /auth/me
    r2 = requests.get(f"{API}/auth/me", headers=headers, timeout=15)
    assert r2.status_code == 200
    assert r2.json()["bio"] == "Nouvelle bio test"


# ---------- Students ----------
def test_students_filters(student_token):
    headers = {"Authorization": f"Bearer {student_token}"}
    r = requests.get(f"{API}/students/filters", headers=headers, timeout=15)
    assert r.status_code == 200
    data = r.json()
    for k in ["countries", "schools", "languages", "interests"]:
        assert k in data
        assert isinstance(data[k], list)
    assert len(data["countries"]) >= 1


def test_students_list_excludes_self_and_admin(student_token):
    headers = {"Authorization": f"Bearer {student_token}"}
    r = requests.get(f"{API}/students", headers=headers, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    emails = [u["email"] for u in data]
    assert SEED_STUDENT_EMAIL not in emails
    assert ADMIN_EMAIL not in emails
    assert len(data) >= 5


def test_students_filter_by_country(student_token):
    headers = {"Authorization": f"Bearer {student_token}"}
    r = requests.get(f"{API}/students?country=Japon", headers=headers, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert all(u["country"] == "Japon" for u in data)


def test_students_requires_auth():
    r = requests.get(f"{API}/students", timeout=15)
    assert r.status_code == 401


# ---------- Infos ----------
def test_infos_list_returns_five():
    r = requests.get(f"{API}/infos", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 5
    slugs = {i["slug"] for i in data}
    assert slugs == {"demarches", "logement", "sante", "transport", "vie-etudiante"}


def test_info_detail_by_slug():
    r = requests.get(f"{API}/infos/logement", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["slug"] == "logement"
    assert data["title"]
    assert data["content"]


def test_info_detail_not_found():
    r = requests.get(f"{API}/infos/inexistant", timeout=15)
    assert r.status_code == 404


# ---------- Events ----------
def test_events_list_returns_eight():
    r = requests.get(f"{API}/events", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 8
    for ev in data:
        assert "id" in ev and "title" in ev and "date" in ev


def test_events_recommended(student_token):
    headers = {"Authorization": f"Bearer {student_token}"}
    r = requests.get(f"{API}/events/recommended", headers=headers, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 1
    assert all(ev["recommended"] is True for ev in data)


def test_participate_toggle(new_user):
    headers = {"Authorization": f"Bearer {new_user['token']}"}
    # get first event
    ev = requests.get(f"{API}/events", timeout=15).json()[0]
    ev_id = ev["id"]
    r1 = requests.post(f"{API}/events/{ev_id}/participate", headers=headers, timeout=15)
    assert r1.status_code == 200
    assert r1.json()["participating"] is True

    r2 = requests.post(f"{API}/events/{ev_id}/participate", headers=headers, timeout=15)
    assert r2.status_code == 200
    assert r2.json()["participating"] is False


def test_participate_event_not_found(new_user):
    headers = {"Authorization": f"Bearer {new_user['token']}"}
    r = requests.post(f"{API}/events/nonexistent-id/participate", headers=headers, timeout=15)
    assert r.status_code == 404


# ---------- Cloudinary ----------
def test_cloudinary_signature(new_user):
    headers = {"Authorization": f"Bearer {new_user['token']}"}
    r = requests.get(f"{API}/cloudinary/signature?folder=users/avatars", headers=headers, timeout=15)
    assert r.status_code == 200
    data = r.json()
    for k in ["signature", "timestamp", "cloud_name", "api_key", "folder"]:
        assert k in data and data[k] not in (None, "")
    assert data["folder"] == "users/avatars"


def test_cloudinary_signature_requires_auth():
    r = requests.get(f"{API}/cloudinary/signature", timeout=15)
    assert r.status_code == 401


def test_cloudinary_rejects_bad_folder(new_user):
    headers = {"Authorization": f"Bearer {new_user['token']}"}
    r = requests.get(f"{API}/cloudinary/signature?folder=malicious/path", headers=headers, timeout=15)
    assert r.status_code == 400
