import json
import sys

def check_alignment(en_path, fr_path):
    with open(en_path, 'r', encoding='utf-8') as f:
        en_data = json.load(f)["project_nodes"]
    with open(fr_path, 'r', encoding='utf-8') as f:
        fr_data = json.load(f)["project_nodes"]
        
    errors = []
    
    if len(en_data) != len(fr_data):
        errors.append(f"Mismatch in total nodes: EN has {len(en_data)}, FR has {len(fr_data)}")
        
    for i, (en_node, fr_node) in enumerate(zip(en_data, fr_data)):
        if en_node["node_id"] != fr_node["node_id"]:
            errors.append(f"Node ID mismatch at index {i}: EN={en_node['node_id']}, FR={fr_node['node_id']}")
            continue
            
        node_id = en_node["node_id"]
        
        if en_node.get("type") != fr_node.get("type"):
            errors.append(f"[{node_id}] Type mismatch: EN={en_node.get('type')}, FR={fr_node.get('type')}")
            
        if en_node.get("type") == "template_node":
            en_qs = en_node.get("template_questions", [])
            fr_qs = fr_node.get("template_questions", [])
            if len(en_qs) != len(fr_qs):
                errors.append(f"[{node_id}] Template questions length mismatch: EN={len(en_qs)}, FR={len(fr_qs)}")
            else:
                for j, (eq, fq) in enumerate(zip(en_qs, fr_qs)):
                    sub_id = eq.get("sub_id")
                    if sub_id != fq.get("sub_id"):
                        errors.append(f"[{node_id}] Sub ID mismatch at index {j}: EN={sub_id}, FR={fq.get('sub_id')}")
                    
                    en_states = eq.get("allowed_states", [])
                    fr_states = fq.get("allowed_states", [])
                    if len(en_states) != len(fr_states):
                        errors.append(f"[{node_id} / {sub_id}] Allowed states length mismatch: EN={len(en_states)}, FR={len(fr_states)}")
        else:
            en_states = en_node.get("allowed_states", [])
            fr_states = fr_node.get("allowed_states", [])
            if len(en_states) != len(fr_states):
                errors.append(f"[{node_id}] Allowed states length mismatch: EN={len(en_states)}, FR={len(fr_states)}")

    if not errors:
        print("SUCCESS: The English and French JSON structures align perfectly!")
    else:
        print("FOUND ALIGNMENT ERRORS:")
        for e in errors:
            print("  - " + e)

if __name__ == "__main__":
    check_alignment('extracted_nodes.json', 'extracted_nodes_fr.json')
