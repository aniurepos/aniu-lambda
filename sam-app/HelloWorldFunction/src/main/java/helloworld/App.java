package helloworld;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

/**
 * Handler for requests to Lambda function.
 * Auth is handled by API Gateway (API Key + Usage Plan).
 * 
 * Test PR workflow — verify unit tests run on PR.
 */
public class App implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent input, final Context context) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Headers", "Content-Type,x-api-key");
        headers.put("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

        // Handle preflight OPTIONS request
        if (input.getHttpMethod() != null && input.getHttpMethod().equalsIgnoreCase("OPTIONS")) {
            return new APIGatewayProxyResponseEvent()
                    .withHeaders(headers)
                    .withStatusCode(200);
        }

        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent()
                .withHeaders(headers);

        // GET request = auth check / health check
        if ("GET".equalsIgnoreCase(input.getHttpMethod())) {
            return response
                    .withStatusCode(200)
                    .withBody("{\"status\": \"ok\"}");
        }

        // POST request = chat message
        try {
            String body = input.getBody();
            // Escape the body to make it valid JSON
            String escapedBody = body != null ? body.replace("\\", "\\\\").replace("\"", "\\\"") : "empty";
            String output = String.format("{ \"message\": \"You said: %s\" }", escapedBody);

            return response
                    .withStatusCode(200)
                    .withBody(output);
        } catch (Exception e) {
            return response
                    .withBody("{\"message\": \"Internal server error\"}")
                    .withStatusCode(500);
        }
    }

    private String getPageContents(String address) throws IOException{
        URL url = new URL(address);
        try(BufferedReader br = new BufferedReader(new InputStreamReader(url.openStream()))) {
            return br.lines().collect(Collectors.joining(System.lineSeparator()));
        }
    }
}
