package helloworld;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

public class AppTest {
  @Test
  public void testGetReturnsOk() {
    App app = new App();
    APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
        .withHttpMethod("GET");
    APIGatewayProxyResponseEvent result = app.handleRequest(request, null);
    assertEquals(200, result.getStatusCode().intValue());
    assertEquals("application/json", result.getHeaders().get("Content-Type"));
    String content = result.getBody();
    assertNotNull(content);
    assertTrue(content.contains("\"status\""));
    assertTrue(content.contains("\"ok\""));
  }

  @Test
  public void testPostReturnsEcho() {
    App app = new App();
    APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
        .withHttpMethod("POST")
        .withBody("Hello!");
    APIGatewayProxyResponseEvent result = app.handleRequest(request, null);
    assertEquals(200, result.getStatusCode().intValue());
    String content = result.getBody();
    assertNotNull(content);
    assertTrue(content.contains("Hello!"));
  }

  @Test
  public void testOptionsReturns200() {
    App app = new App();
    APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
        .withHttpMethod("OPTIONS");
    APIGatewayProxyResponseEvent result = app.handleRequest(request, null);
    assertEquals(200, result.getStatusCode().intValue());
  }
}
