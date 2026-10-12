# ---- build ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# ---- run ----
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd --system --create-home cems
COPY --from=build /app/target/cems-backend-1.0.0.jar app.jar
USER cems
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
