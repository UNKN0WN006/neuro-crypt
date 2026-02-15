import numpy as np
from sklearn.ensemble import IsolationForest
import json
import os

BASELINE_THRESHOLD = 0.5
CONTAMINATION = 0.05
MODEL_PATH = "models/cbhs_model.pkl"

class CBHSModel:
    # Cognitive-Behavioral Health Signature model
    def __init__(self):
        self.clf = IsolationForest(
            contamination=CONTAMINATION,
            random_state=42,
            n_estimators=100
        )
        self.fitted = False
        self.baseline = None

    def FitBaseline(self, feats):
        # Train on enrollment features
        self.clf.fit(feats)
        self.baseline = feats.mean(axis=0)
        self.fitted = True

    def PredictAnomaly(self, feat_vec):
        # Returns contamination score [0, 1]. >threshold = anomaly
        if not self.fitted:
            return None
        
        scores = -self.clf.decision_function(feat_vec)
        norm_scores = (scores - scores.min()) / (scores.max() - scores.min() + 1e-8)
        return float(norm_scores[0])

    def CheckAuth(self, feat_vec):
        # Returns True if authenticated
        score = self.PredictAnomaly(feat_vec)
        return score < BASELINE_THRESHOLD if score else False

    def SaveModel(self, path=MODEL_PATH):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        import pickle
        with open(path, 'wb') as f:
            pickle.dump((self.clf, self.baseline), f)

    def LoadModel(self, path=MODEL_PATH):
        if not os.path.exists(path):
            return False
        import pickle
        with open(path, 'rb') as f:
            self.clf, self.baseline = pickle.load(f)
        self.fitted = True
        return True
