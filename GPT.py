import os
from groq import Groq

# Initialize the client with the API key
client = Groq(api_key="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")

def translate_asl_gloss():
    asl_gloss = input("Enter ASL gloss text: ")
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": f"Translate the following ASL gloss into English: {asl_gloss}. And do not add more than that. Remove quotation marks. Be simple and clear. Only give the translated text.",
            }
        ],
        model="llama3-8b-8192",
    )

    translated_text = chat_completion.choices[0].message.content
    print("Translated text:", translated_text)

# Run the translation function
translate_asl_gloss()
