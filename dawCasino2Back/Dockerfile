# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the application, skipping tests to speed up the process
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/dawCasino2Back-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8989
ENTRYPOINT ["java", "-jar", "app.jar"]
