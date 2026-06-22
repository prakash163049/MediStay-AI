import urllib.request, json

def predict(payload, label='Test'):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        'http://127.0.0.1:5000/predict', data=data,
        headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as r:
            res = json.load(r)
        p = res['probabilities']
        print(f"[{label}]")
        print(f"  -> {res['label']} | short={p['short']}% medium={p['medium']}% long={p['long']}%")
        print(f"  PASS")
    except Exception as e:
        print(f"[{label}] ERROR: {e}")

# TEST 1: Simple Mode (user provides 7 + 2 defaults, backend fills hospital fields)
predict({
    'Department': 'radiotherapy',
    'Type_of_Admission': 'Emergency',
    'Severity_of_Illness': 'Extreme',
    'Age': '51-60',
    'Visitors_with_Patient': 2,
    'Bed_Grade': 2,
    'Admission_Deposit': 4911,
    'Hospital_code': 8,
    'City_Code_Patient': 7,
}, 'Simple Mode - backend auto-fills hospital fields')

# TEST 2: Advanced Short Stay
predict({
    'Hospital_code': 8, 'Hospital_type_code': 'c', 'City_Code_Hospital': 3,
    'Hospital_region_code': 'Z', 'Available_Extra_Rooms_in_Hospital': 3,
    'Department': 'radiotherapy', 'Ward_Type': 'R', 'Ward_Facility_Code': 'F',
    'Bed_Grade': 2, 'City_Code_Patient': 7, 'Type_of_Admission': 'Emergency',
    'Severity_of_Illness': 'Extreme', 'Visitors_with_Patient': 2,
    'Age': '51-60', 'Admission_Deposit': 4911,
}, 'Advanced Mode - Short Stay sample')

# TEST 3: Advanced Medium Stay
predict({
    'Hospital_code': 2, 'Hospital_type_code': 'c', 'City_Code_Hospital': 5,
    'Hospital_region_code': 'Z', 'Available_Extra_Rooms_in_Hospital': 2,
    'Department': 'radiotherapy', 'Ward_Type': 'S', 'Ward_Facility_Code': 'F',
    'Bed_Grade': 2, 'City_Code_Patient': 7, 'Type_of_Admission': 'Trauma',
    'Severity_of_Illness': 'Extreme', 'Visitors_with_Patient': 2,
    'Age': '51-60', 'Admission_Deposit': 5954,
}, 'Advanced Mode - Medium Stay sample')

# TEST 4: Advanced Long Stay
predict({
    'Hospital_code': 19, 'Hospital_type_code': 'a', 'City_Code_Hospital': 7,
    'Hospital_region_code': 'Y', 'Available_Extra_Rooms_in_Hospital': 2,
    'Department': 'radiotherapy', 'Ward_Type': 'S', 'Ward_Facility_Code': 'C',
    'Bed_Grade': 3, 'City_Code_Patient': 7, 'Type_of_Admission': 'Emergency',
    'Severity_of_Illness': 'Minor', 'Visitors_with_Patient': 4,
    'Age': '71-80', 'Admission_Deposit': 4718,
}, 'Advanced Mode - Long Stay sample')

# TEST 5: Missing field error handling
try:
    data = json.dumps({'Department': 'surgery'}).encode()
    req = urllib.request.Request(
        'http://127.0.0.1:5000/predict', data=data,
        headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        res = json.load(r)
    print("[Missing fields test] Unexpected success:", res)
except urllib.error.HTTPError as e:
    body = json.loads(e.read().decode())
    print(f"[Missing fields test] Got expected error: {body.get('error','')[:80]}")
    print("  PASS")

print()
print("All tests complete.")
