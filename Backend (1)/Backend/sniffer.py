from scapy.all import sniff, IP, TCP, UDP
from collections import defaultdict
import threading

data_lock = threading.Lock()
flows = defaultdict(list)

def packet_callback(packet):
    if IP in packet:
        proto = "TCP" if TCP in packet else "UDP" if UDP in packet else "OTHER"
        key = (packet[IP].src, packet[IP].dst, proto)
        
        with data_lock:
            flows[key].append(packet)
            if len(flows[key]) % 10 == 0:
                print(f"Captured: {key[0]} -> {key[1]} | Packets in Flow: {len(flows[key])}")

def start_sniffing():
    print("Sniffer is active and sharing memory with API...")
    sniff(prn=packet_callback, store=0)