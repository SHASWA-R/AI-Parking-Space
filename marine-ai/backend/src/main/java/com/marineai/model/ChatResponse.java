package com.marineai.model;

import java.util.List;
import java.util.Map;

public class ChatResponse {
    public String reply;
    public String conversationId;
    public List<String> suggestedQuestions;
    public Map<String, Object> action;

    public ChatResponse() {}

    public ChatResponse(String reply, String conversationId, List<String> suggestedQuestions, Map<String, Object> action) {
        this.reply = reply;
        this.conversationId = conversationId;
        this.suggestedQuestions = suggestedQuestions;
        this.action = action;
    }
}
