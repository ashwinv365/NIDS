import threading, time, uuid, joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sniffer import flows, start_sniffing, data_lock
from features import extract_features

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


try:
    model = joblib.load("nids_rf_model.pkl")
    le = joblib.load("nids_label_encoder.pkl")
    feature_list = joblib.load("nids_features_list.pkl")
    print("System Ready.")
except:
    model = le = feature_list = None

@app.get("/predict_live")
async def predict_live():
    predictions = []
    with data_lock:
        keys = list(flows.keys())

    for key in keys:
        with data_lock:
            flow = flows.pop(key, None)
        if not flow: continue

        try:
            feat = extract_features(flow)
            
            label = "BENIGN"
            is_threat = False
            conf = 0.5  
            
            unique_ports = feat.get("Unique_Ports", 0)
            packet_count = len(flow)
            
            if unique_ports > 5:
                label = "NETWORK PORTSCAN"
                is_threat = True
                conf = 0.99  
            elif packet_count > 100:
                label = "DOS ATTACK (FLOODING)"
                is_threat = True
                conf = 0.97  
            elif packet_count > 20 and unique_ports == 1:
                label = "POTENTIAL BRUTE FORCE"
                is_threat = True
                conf = 0.90  
            elif model and feature_list:
                X = pd.DataFrame([feat]).reindex(columns=feature_list, fill_value=0)
                pred_idx = model.predict(X)[0]
                label = str(le.inverse_transform([pred_idx])[0]).upper()
                is_threat = (label != "BENIGN")
                try:
                    probs = model.predict_proba(X)[0]
                    conf = float(np.max(probs))
                except:
                    conf = 0.85
            else:
                label = "BENIGN"
                is_threat = False
                conf = 0.40 
            predictions.append({
                "id": str(uuid.uuid4()),
                "timestamp": time.strftime("%H:%M:%S"),
                "threat_type": label,
                "status": "THREAT" if is_threat else "BENIGN",
                "severity": "HIGH" if is_threat else "LOW",
                "confidence": conf,
                "source_ip": str(key[0]),
                "dest_ip": str(key[1]),
                "packet_count": len(flow)
            })
        except Exception as e:
            print(f"Error: {e}")

    return {"predictions": predictions}

threading.Thread(target=start_sniffing, daemon=True).start()
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)