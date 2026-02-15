import numpy as np

class FeatureExtractor:
    # Behavioral signal -> ML features
    
    @staticmethod
    def FromRaw(latencies, kstEv, decTime, accMag, patAcc):
        # Input: latency array, keystroke events, decision times, acceleration magnitude, pattern accuracy
        feats = []
        
        # Latency statistics
        feats.extend([
            np.mean(latencies),
            np.std(latencies),
            np.percentile(latencies, 75),
            np.var(latencies)
        ])
        
        # Keystroke dynamics
        if len(kstEv) > 1:
            kstInt = np.diff(kstEv)
            feats.extend([
                np.mean(kstInt),
                np.std(kstInt),
                np.max(kstInt) - np.min(kstInt)
            ])
        else:
            feats.extend([0, 0, 0])
        
        # Decision timing
        feats.extend([
            np.mean(decTime),
            np.std(decTime),
            np.percentile(decTime, 90)
        ])
        
        # Acceleration patterns
        feats.extend([
            np.mean(accMag),
            np.std(accMag),
            np.max(accMag)
        ])
        
        # Pattern accuracy
        feats.append(patAcc / 100.0)
        
        return np.array(feats).reshape(1, -1)

    @staticmethod
    def GenMockData(n_samples=50):
        # Generate synthetic baseline for demo
        data = []
        for _ in range(n_samples):
            lat = np.random.normal(150, 30, 12)
            kst = np.cumsum(np.random.exponential(50, 15))
            dec = np.random.normal(200, 60, 10)
            acc = np.random.normal(2.5, 0.8, 20)
            pat = np.random.uniform(70, 95)
            
            feats = FeatureExtractor.FromRaw(lat, kst, dec, acc, pat)
            data.append(feats[0])
        
        return np.array(data)

    @staticmethod
    def GenAnomalousData(n_samples=10):
        # Stress/altered behavior baseline
        data = []
        for _ in range(n_samples):
            lat = np.random.normal(250, 50, 12)  # Slower response
            kst = np.cumsum(np.random.exponential(80, 15))  # Irregular typing
            dec = np.random.normal(100, 80, 10)  # Faster decisions (stress)
            acc = np.random.normal(4.5, 1.5, 20)  # More erratic
            pat = np.random.uniform(30, 60)  # Lower accuracy
            
            feats = FeatureExtractor.FromRaw(lat, kst, dec, acc, pat)
            data.append(feats[0])
        
        return np.array(data)
