package com.marineai.model;

import java.util.List;
import java.util.Map;

public class ChatRequest {
    public String message;
    public String conversationId;
    public List<Map<String, String>> history;
    public Map<String, Object> context;
}
