from scapy.all import IP, TCP, UDP

def extract_features(flow):
    try:
        times = [float(p.time) for p in flow]
        lengths = [len(p) for p in flow]
        duration = max(times) - min(times) if len(times) > 1 else 0
        
        dst_ports = set()
        for p in flow:
            if TCP in p:
                dst_ports.add(p[TCP].dport)
            elif UDP in p:
                dst_ports.add(p[UDP].dport)

        return {
            "Destination Port": list(dst_ports)[0] if dst_ports else 0,
            "Flow Duration": duration,
            "Total Fwd Packets": len(flow),
            "Total Length of Fwd Packets": sum(lengths),
            "Fwd Packet Length Max": max(lengths) if lengths else 0,
            "Fwd Packet Length Min": min(lengths) if lengths else 0,
            "Fwd Packet Length Mean": sum(lengths)/len(lengths) if lengths else 0,
            "Flow Pkts/s": len(flow) / duration if duration > 0 else 0,
            "Unique_Ports": len(dst_ports) 
        }
    except Exception as e:
        print(f"Feature Extraction Error: {e}")
        return {"Unique_Ports": 0}