FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY agent.py kurallar.py ./
ENV POSTA_DB=/data/posta.db PYTHONUNBUFFERED=1
CMD ["python3", "agent.py", "izle", "--aralik", "120"]
