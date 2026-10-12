# ---- build ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy context into temporary location and detect whether root or backend context was used
COPY . /tmp/source/
RUN if [ -d "/tmp/source/backend" ]; then \
      cp -r /tmp/source/backend/* /app/; \
    else \
      cp -r /tmp/source/* /app/; \
    fi && \
    mvn clean package -DskipTests

# ---- run ----
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd --system --create-home cems
COPY --from=build /app/target/cems-backend-1.0.0.jar app.jar
USER cems
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
