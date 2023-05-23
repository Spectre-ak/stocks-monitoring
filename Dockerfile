FROM node:16 as build-step
RUN mkdir /app
WORKDIR /app
COPY ./app-ui/package.json /app
RUN npm install
COPY ./app-ui /app
RUN npm run build


FROM python:3.9.12

RUN apt-get update && apt-get install -y \
    libglpk-dev \
    libsodium-dev \
    libpq-dev \
    libv8-dev \
    default-libmysqlclient-dev \
    postgresql

RUN apt-get update -qq && apt-get install -y \
    libssl-dev \
    libcurl4-gnutls-dev

RUN apt-get update && apt-get install -y \
    libxml2-dev \
    libpq-dev unzip curl


WORKDIR /app
COPY --from=build-step /app/build ./static
ADD . /app
RUN pip install -U pip
RUN pip install -r requirements.txt

EXPOSE 5000
CMD ["python","app.py"]