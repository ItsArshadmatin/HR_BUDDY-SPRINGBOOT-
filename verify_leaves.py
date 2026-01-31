import urllib.request
import urllib.parse
import json
import datetime
import sys

BASE_URL = "http://localhost:8081/api"

def login(email, password):
    url = f"{BASE_URL}/auth/login"
    data = json.dumps({"email": email, "password": password}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                body = json.loads(response.read().decode())
                return body['token']
    except urllib.error.URLError as e:
        print(f"Login failed for {email}: {e}")
        return None

def apply_leave(token, reason):
    url = f"{BASE_URL}/leaves"
    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
    day_after = (datetime.date.today() + datetime.timedelta(days=2)).isoformat()
    
    data = json.dumps({
        "startDate": tomorrow,
        "endDate": day_after,
        "reason": reason
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    })
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"Apply leave failed: {e.read().decode()}")
        return None

def get_pending_leaves(token):
    url = f"{BASE_URL}/leaves?status=PENDING"
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}'})
    try:
        with urllib.request.urlopen(req) as response:
             return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"Fetch leaves failed: HTTP Error {e.code}: {e.read().decode()}")
        return []
    except Exception as e:
        print(f"Fetch leaves failed: {e}")
        return []

def update_status(token, leave_id, status):
    url = f"{BASE_URL}/leaves/{leave_id}/status?status={status}"
    req = urllib.request.Request(url, method='PUT', headers={'Authorization': f'Bearer {token}'})
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Update status failed: {e}")
        return None

def main():
    print("--- Starting Verification Magic ---")
    
    # 1. Login Employees
    token1 = login("employee1@ems.com", "password")
    token2 = login("employee2@ems.com", "password")
    token_hr = login("hr@ems.com", "password")
    
    if not token1 or not token2 or not token_hr:
        print("CRITICAL: Failed to login. Is backend running?")
        sys.exit(1)
        
    print("[x] Logged in: Emp1, Emp2, HR")

    # 2. Apply Leaves
    l1 = apply_leave(token1, "Magic Test 1")
    l2 = apply_leave(token2, "Magic Test 2")
    
    if l1: print(f"[x] Emp1 applied for leave (ID: {l1['id']})")
    if l2: print(f"[x] Emp2 applied for leave (ID: {l2['id']})")

    # 3. HR Checks
    pending = get_pending_leaves(token_hr)
    print(f"[x] HR sees {len(pending)} pending requests.")
    
    target1 = next((l for l in pending if l['reason'] == "Magic Test 1"), None)
    target2 = next((l for l in pending if l['reason'] == "Magic Test 2"), None)
    
    if target1:
        res = update_status(token_hr, target1['id'], "APPROVED")
        print(f"[x] HR Approved Emp1's request. New Status: {res['status']}")
        
    if target2:
        res = update_status(token_hr, target2['id'], "REJECTED")
        if res: print(f"[x] HR Rejected Emp2's request. New Status: {res['status']}")

    # 4. Edge Cases
    print("\n--- Edge Case Testing ---")
    
    # A. Past Leave
    print("[Testing] Applying for Past Date...")
    url_past = f"{BASE_URL}/leaves"
    past_date = (datetime.date.today() - datetime.timedelta(days=2)).isoformat()
    data_past = json.dumps({"startDate": past_date, "endDate": past_date, "reason": "Time Travel"}).encode('utf-8')
    req_past = urllib.request.Request(url_past, data=data_past, headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token1}'})
    try:
        urllib.request.urlopen(req_past)
        print("[FAIL] Backend accepted past date!", "FAIL")
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode())
        print(f"[SUCCESS] Backend rejected past date. Code: {e.code}, Message: {body.get('message')}")

    # B. Insufficient Balance (Optional - requires consuming all balance. Skipping for now to keep test fast)

    print("--- Verification Complete ---")

if __name__ == "__main__":
    main()
