# 📝 Adding Content

Deepsafe is designed to be extensible. Content creators can add new levels and quizzes without touching the core game logic.

## 🧬 Quiz JSON Structure

Quizzes are currently stored in the database (or mock files). A standard quiz object looks like this:

```json
{
  "id": "quiz_unique_id",
  "level_id": "level_associated_id",
  "questions": [
    {
      "id": "q1",
      "text": "What is the primary danger of a 'Deepfake'?",
      "type": "text",
      "options": [
        "It makes videos look grainy",
        "It can impersonate real people to spread misinformation",
        "It uses too much internet data",
        "It breaks your camera"
      ],
      "correct_index": 1,
      "explanation": "Deepfakes use AI to swap faces or voices, making it look like someone said or did something they never did."
    }
  ]
}
```

### Field Explanations

- **`text`**: The main question displayed to the user. Keep it under 140 characters for best mobile visibility.
- **`type`**:
    - `'text'`: Standard multiple choice.
    - `'image'`: Displays an image above the question (requires `image_url`).
- **`options`**: An array of exactly 4 strings.
- **`correct_index`**: The 0-based index of the correct answer in the `options` array.
- **`explanation`**: The feedback text shown **after** the user answers (regardless of right/wrong). Use this for education.

## 🖼️ Image Quizzes

To create an image-based question:

1.  **Upload**: Upload your image to the Supabase Storage bucket named `quiz-assets`.
2.  **Get URL**: Get the public URL (e.g., `https://xyz.supabase.co/storage/v1/object/public/quiz-assets/phishing-email.png`).
3.  **JSON**: Add the `image_url` field to your question object.

```json
{
  "id": "q2",
  "text": "Is this email legitimate?",
  "type": "image",
  "image_url": "https://[YOUR-SUPABASE-URL]/phishing-example.png",
  "options": ["Yes", "No, it's Phishing", "Unsure", "It's Spam"],
  "correct_index": 1,
  "explanation": "Notice the sender address is 'support@g00gle.com' - that's a classic typo spoofing!"
}
```
