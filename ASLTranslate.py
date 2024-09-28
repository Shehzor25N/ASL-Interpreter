from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM



# Load model directly
tokenizer = AutoTokenizer.from_pretrained("Krithiik/t5-base-gloss-to-sentence")
model = AutoModelForSeq2SeqLM.from_pretrained("Krithiik/t5-base-gloss-to-sentence")
pipe = pipeline("text2text-generation", model="Krithiik/t5-base-gloss-to-sentence")


# Function to translate ASL to English
def translate_asl_to_english(asl_sentence):
    # Use the pipeline for translation
    result = pipe(asl_sentence)
    print(result)  # Print the full output
    return result

# Test the function with the input "EVERY-SATURDAY WHAT-DO YOU?"
asl_sentence = "WALK DOG, YOU MIND?"
translated_sentence = translate_asl_to_english(asl_sentence)
print(f"ASL: {asl_sentence}\nTranslation Output: {translated_sentence}")


