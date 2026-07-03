from fastapi import FastAPI

app = FastAPI(title="Chartix AI Service")

@app.get("/")
def read_root():
    return {"message": "Welcome to Chartix AI Service"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
