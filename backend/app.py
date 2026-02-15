from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json
from models import CBHSModel
from features import FeatureExtractor
import os

app = Flask(__name__)
CORS(app)

# Session store (dev mode)
SESSION = {
    'users': {},
    'mdl': CBHSModel()
}

def InitModel():
    # Load or create model
    if not SESSION['mdl'].LoadModel():
        print("[*] Training baseline model...")
        baseline = FeatureExtractor.GenMockData(50)
        SESSION['mdl'].FitBaseline(baseline)
        SESSION['mdl'].SaveModel()
    return SESSION['mdl']

@app.route('/health', methods=['GET'])
def Health():
    return jsonify({'status': 'ok'}), 200

@app.route('/auth/register', methods=['POST'])
def Register():
    # Enroll user with baseline
    data = request.json
    uid = data.get('uid')
    
    if not uid or uid in SESSION['users']:
        return jsonify({'err': 'Invalid or existing user'}), 400
    
    feats = np.array(data.get('feats', []))
    if feats.size == 0:
        return jsonify({'err': 'No features provided'}), 400
    
    SESSION['users'][uid] = {
        'baseline': feats.tolist(),
        'created': data.get('ts', 0),
        'auths': 0
    }
    
    return jsonify({
        'msg': f'User {uid} registered',
        'uid': uid,
        'baseline_dim': len(feats)
    }), 201

@app.route('/auth/verify', methods=['POST'])
def Verify():
    # Real-time authentication
    data = request.json
    uid = data.get('uid')
    feats = np.array(data.get('feats', [])).reshape(1, -1)
    
    if not uid or uid not in SESSION['users']:
        return jsonify({'err': 'User not found'}), 404
    
    # Predict
    mdl = SESSION['mdl']
    anomScore = mdl.PredictAnomaly(feats)
    isAuth = mdl.CheckAuth(feats)
    
    SESSION['users'][uid]['auths'] += 1
    
    return jsonify({
        'authenticated': bool(isAuth),
        'anomaly_score': float(anomScore),
        'threshold': 0.5,
        'user': uid,
        'attempt': SESSION['users'][uid]['auths']
    }), 200

@app.route('/auth/status', methods=['GET'])
def Status():
    uid = request.args.get('uid')
    
    if not uid or uid not in SESSION['users']:
        return jsonify({'err': 'User not found'}), 404
    
    user = SESSION['users'][uid]
    return jsonify({
        'uid': uid,
        'registered': True,
        'baseline_feats': len(user['baseline']),
        'auth_attempts': user['auths'],
        'created_ts': user['created']
    }), 200

@app.route('/auth/logout', methods=['POST'])
def Logout():
    data = request.json
    uid = data.get('uid')
    
    if uid and uid in SESSION['users']:
        del SESSION['users'][uid]
        return jsonify({'msg': f'User {uid} logged out'}), 200
    
    return jsonify({'err': 'User not found'}), 404

@app.route('/demo/inject', methods=['POST'])
def DemoInject():
    # For hackathon demo: inject normal vs anomalous data
    mode = request.json.get('mode', 'normal')
    
    if mode == 'normal':
        data = FeatureExtractor.GenMockData(1)
    else:
        data = FeatureExtractor.GenAnomalousData(1)
    
    return jsonify({
        'feats': data[0].tolist(),
        'mode': mode
    }), 200

if __name__ == '__main__':
    InitModel()
    app.run(debug=True, host='0.0.0.0', port=5000)
