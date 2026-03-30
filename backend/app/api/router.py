from fastapi import APIRouter
from app.api.routes import auth, courses, assessments, availability, plan, study_sessions, analytics, terms

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(courses.router)
api_router.include_router(assessments.router)
api_router.include_router(study_sessions.router)
api_router.include_router(availability.router)
api_router.include_router(plan.router)
api_router.include_router(analytics.router)
api_router.include_router(terms.router)
