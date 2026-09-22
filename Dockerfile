# =========================================================
# BUILD STAGE
# =========================================================

FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /build

# Copy Maven configuration first
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw.cmd ./

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download dependencies first
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build application
RUN ./mvnw clean package -DskipTests


# =========================================================
# RUNTIME STAGE
# =========================================================

FROM eclipse-temurin:17-jre

WORKDIR /app

# Create non-root user
RUN groupadd --system connect && \
    useradd --system --gid connect --home-dir /app connect

# Create upload directories
RUN mkdir -p /app/uploads/images \
             /app/uploads/files && \
    chown -R connect:connect /app

# Copy generated jar
COPY --from=build /build/target/*.jar /app/connect.jar

# Give application ownership
RUN chown connect:connect /app/connect.jar

# Run as non-root user
USER connect

# Spring Boot port
EXPOSE 8080

# Start application
ENTRYPOINT ["java", "-jar", "/app/connect.jar"]