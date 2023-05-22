FROM node:16 as build-step
RUN mkdir /app
WORKDIR /app
COPY ./app-ui/package.json /app
RUN npm install
COPY ./app-ui /app
RUN npm run build


FROM python:3.6.7
WORKDIR /app
COPY --from=build-step /app/build ./static
ADD . /app
RUN pip install -U pip
RUN pip install -r requirements.txt

EXPOSE 5000
CMD ["python","app.py"]