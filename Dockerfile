FROM node:16 as build-step
RUN mkdir /app
WORKDIR /app
COPY ./app-ui/package.json /app
RUN npm install
COPY ./app-ui /app
RUN npm run build

RUN apt-get update && apt-get install -y \
    libglpk-dev \
    libsodium-dev \
    libpq-dev \
    libv8-dev \
    default-libmysqlclient-dev \
    postgresql

FROM python:3.6.7
WORKDIR /app
COPY --from=build-step /app/build ./static
ADD . /app
RUN pip install -U pip
RUN pip install -r requirements.txt

EXPOSE 5000
CMD ["python","app.py"]