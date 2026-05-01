package helloworld;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for the deployed API Gateway + Lambda.
 *
 * These tests run AFTER the CDK stack is deployed.
 * They require two system properties:
 *   -Dapi.url=https://xxxxxxxxxx.execute-api.region.amazonaws.com/prod/
 *   -Dapi.key=the-api-key-value
 */
class ApiIntegrationTest {

    private static String apiUrl;
    private static String apiKey;
    private static HttpClient client;

    @BeforeAll
    static void setup() {
        apiUrl = System.getProperty("api.url", "");
        apiKey = System.getProperty("api.key", "");
        assertFalse(apiUrl.isEmpty(), "System property 'api.url' must be set");
        assertFalse(apiKey.isEmpty(), "System property 'api.key' must be set");

        // Ensure URL ends with /
        if (!apiUrl.endsWith("/")) {
            apiUrl = apiUrl + "/";
        }

        client = HttpClient.newHttpClient();
    }

    @Test
    void testGetReturns200() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("x-api-key", apiKey)
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode(), "GET / should return 200");

        JsonObject body = JsonParser.parseString(response.body()).getAsJsonObject();
        assertTrue(body.has("status"), "Response should contain 'status' field");
        assertEquals("ok", body.get("status").getAsString(), "Status should be 'ok'");
    }

    @Test
    void testPostReturnsEcho() throws Exception {
        String requestBody = "{\"message\":\"hello from integ test\"}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .header("x-api-key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode(), "POST / should return 200");

        JsonObject body = JsonParser.parseString(response.body()).getAsJsonObject();
        assertTrue(body.has("message"), "Response should contain 'message' field");
        String message = body.get("message").getAsString();
        assertTrue(message.contains("hello from integ test"),
                "Response should echo the input message. Got: " + message);
    }

    @Test
    void testGetWithoutApiKeyReturns403() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(403, response.statusCode(),
                "GET / without API key should return 403. Got: " + response.statusCode());
    }

    @Test
    void testPostWithoutApiKeyReturns403() throws Exception {
        String requestBody = "{\"message\":\"test\"}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(403, response.statusCode(),
                "POST / without API key should return 403. Got: " + response.statusCode());
    }

    @Test
    void testOptionsReturns200or204() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("x-api-key", apiKey)
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertTrue(response.statusCode() == 200 || response.statusCode() == 204,
                "OPTIONS / should return 200 or 204. Got: " + response.statusCode());
    }
}
