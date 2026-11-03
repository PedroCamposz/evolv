# EVOLV - imagem unica com front-end (React) + back-end (Spring Boot).
# Usada para publicar o sistema no Render (ou qualquer servico com Docker).

# 1) Build do front-end
FROM node:20 AS front
WORKDIR /front
COPY evolv-frontend/package.json evolv-frontend/package-lock.json ./
RUN npm ci
COPY evolv-frontend/ ./
RUN npm run build

# 2) Build do back-end, ja com o front dentro de resources/static
FROM maven:3.9-eclipse-temurin-17 AS back
WORKDIR /back
COPY evolv-backend/pom.xml ./
RUN mvn -q -B dependency:go-offline
COPY evolv-backend/src ./src
COPY --from=front /front/dist ./src/main/resources/static
RUN mvn -q -B package -DskipTests

# 3) Imagem final, so com o Java e o .jar
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=back /back/target/*.jar app.jar
# Console do H2 desligado no site publico: ele permite rodar SQL no banco.
ENV SPRING_H2_CONSOLE_ENABLED=false
ENV JAVA_OPTS="-Xmx350m"
EXPOSE 8080
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
