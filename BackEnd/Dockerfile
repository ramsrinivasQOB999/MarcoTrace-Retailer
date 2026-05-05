# Render Web Service: root directory BackEnd, Dockerfile path "."
# https://render.com/docs/docker

FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY sonar-project.properties ./
RUN chmod +x mvnw

COPY src src

RUN ./mvnw -ntp -Pprod clean package -DskipTests \
  && JAR="$(ls target/*.jar | grep -v plain | head -n1)" \
  && test -n "$JAR" \
  && cp "$JAR" /app/application.jar

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=build /app/application.jar ./application.jar

# Render sets PORT; Spring must listen on it.
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/application.jar --spring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} --server.port=${PORT:-8080}"]
