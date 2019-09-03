import sequence
import json

sn = 'grand'
videoId_dict = {'inside':'28WOIMiJtQQ','grand':'hbvvEF8vUIA','sesame':'-zN45XxYMdU'}
videoId_num = {'inside':'1_inside','grand':'2_grand','sesame':'3_sesame'}
long_seq = {'inside':'insideout','grand':'grand','sesame':'kermit'}

for sn in long_seq.keys():
    s = sequence.Sequence.from_json('./sequences/blossom/'+long_seq[sn]+'_sequence.json',True)
    split_time = 5000
    last_mod = split_time-1
    sub_s = []
    start_i = []
    for i,f in enumerate(s.frames):
        millis = f.millis
        mod = millis % split_time
        if (mod < last_mod):
            start_i.append(i)
            print(millis)
        last_mod = mod

    start_i.append(-1)
    trigger_list = []
    for j,i in enumerate(start_i):
        if (j==len(start_i)-1):
            break
        seq_name = sn+str(j)
        print(i)
        sub_s = s.frames[i:start_i[j+1]]
        frames_list = []
        start_millis = sub_s[0].millis
        for k,f in enumerate(sub_s):
            millis = f.millis-start_millis
            frames_list.append({
              'millis': float(millis),
              'positions': [{'dof': k, 'pos': v / 50.0 + 3} for k, v in f.positions.items()]
            })
        print(j)

        g = seq_name
        if (j==len(start_i)-2):
            g = g+'/calm'
        if (j==0):
            start_millis = start_millis+50
        trigger_list.append({'emotion':'happy','gesture':g,'time':start_millis})

        with open('./sequences/blossom/' + seq_name + '_sequence.json', 'w') as seq_file:
            json.dump({'animation': seq_name, 'frame_list': frames_list}, seq_file, indent=2)


    with open('./reactions/' + videoId_num[sn]+ '.json', 'w') as seq_file:
        json.dump({'triggers':trigger_list,'videoId':videoId_dict[sn]}, seq_file, indent=2)

