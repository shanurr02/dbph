import pickle
import pandas as pd
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Load the model and vectorizer
regmodel = pickle.load(open('dectree.pkl', 'rb'))
vectorizer = pickle.load(open('decvec.pkl', 'rb'))

@app.route('/')
def home():
    return render_template('home.html')

def predict_text(text):
    # Vectorize the text
    text_vectorized = vectorizer.transform([text]).toarray()

    # Perform text preprocessing here if needed

    # Predict using the model
    prediction = regmodel.predict(text_vectorized)

    return prediction.tolist()

@app.route('/predict_csv', methods=['POST'])
def predict_csv():
    try:
        # Check if the request contains a file
        if 'file' not in request.files:
            raise ValueError("No file provided in the request.")

        file = request.files['file']

        # Check if the file has a CSV extension
        if not file.filename.endswith('.csv'):
            raise ValueError("Only CSV files are supported.")

        # Read the CSV file into a Pandas DataFrame
        df = pd.read_csv(file)

        # Check if the CSV file contains a 'text' column
        if 'text' not in df.columns:
            raise ValueError("CSV file must contain a 'text' column.")

        # Get the texts from the 'text' column
        texts = df['text'].tolist()

        # Make predictions for each text
        predictions = [predict_text(text) for text in texts]

        result = {'predictions': predictions}
        return jsonify(result)

    except Exception as e:
        error_message = {'error': str(e)}
        return jsonify(error_message), 400

if __name__ == "__main__":
    app.run(debug =False, host = "0.0.0.0")
