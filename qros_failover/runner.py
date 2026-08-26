import hashlib,json,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parent
cap=json.loads((ROOT/'task_capsule.json').read_text())
assert cap['scientific_scope']=='SYNTHETIC_ONLY_NO_HOLDOUT'
n=int(cap['work_units'])
value=sum(range(n))
assert value==int(cap['expected']['sum_i_0_n_minus_1'])
cap_bytes=json.dumps(cap,sort_keys=True,separators=(',',':')).encode()
cap_sha=hashlib.sha256(cap_bytes).hexdigest()
result={'schema':'QROS_FAILOVER_RECEIPT_v1','task_id':cap['task_id'],'status':'PASS','work_units':n,'result':value,'capsule_sha256':cap_sha,'scientific_scope':cap['scientific_scope']}
core=json.dumps(result,sort_keys=True,separators=(',',':')).encode()
result['result_root_sha256']=hashlib.sha256(core).hexdigest()
out=ROOT/'out';out.mkdir(exist_ok=True)
(out/'receipt.json').write_text(json.dumps(result,sort_keys=True,indent=2)+'\n')
(out/'receipt.sha256').write_text(hashlib.sha256((out/'receipt.json').read_bytes()).hexdigest()+'  receipt.json\n')
print(json.dumps(result,sort_keys=True))
