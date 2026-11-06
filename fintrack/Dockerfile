
# Stage 1 — Build the application
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy Maven configuration
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy application source code
COPY src ./src

# Build Spring Boot JAR
RUN mvn clean package -DskipTests


# Stage 2 — Run the application
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the generated JAR
COPY --from=build /app/target/*.jar app.jar

# Default application port
EXPOSE 8081

# Start Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
