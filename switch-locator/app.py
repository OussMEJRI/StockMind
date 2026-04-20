from flask import Flask, jsonify
from flask_cors import CORS
import random
import time
import threading

app = Flask(__name__)
CORS(app)

# Variable globale pour stocker le nombre de PC
nb_pcs = 0

def update_nb_pcs():
    global nb_pcs
    while True:
        nb_pcs = random.randint(1000, 1500)
        print(f"Mis à jour du nombre de PC : {nb_pcs}")
        time.sleep(2 * 60 * 60)

# Démarrer le thread
threading.Thread(target=update_nb_pcs, daemon=True).start()

@app.route('/nb_pcs', methods=['GET'])
def get_nb_pcs():
    return jsonify({"nb_pcs": nb_pcs})

if __name__ == '__main__':
    nb_pcs = random.randint(1000, 1500)
    app.run(host='0.0.0.0', port=4200)
