from fastapi import APIRouter
from app.api.routes import auth, courses, assessments, availability, plan

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(courses.router)
api_router.include_router(assessments.router)
api_router.include_router(availability.router)
api_router.include_router(plan.router)
