import { AudioClip, AudioSource } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import InteractionIcon from './InteractionIcon';

export default class AudioInteraction extends ZepetoScriptBehaviour {

    public audioClip: AudioClip;
    private _audioSource: AudioSource;
    private _interactionIcon :InteractionIcon;

    Start() {    
        this._interactionIcon = this.transform.GetComponent<InteractionIcon>();
        
        this._interactionIcon.OnClickEvent.AddListener(()=> {
            this._interactionIcon.HideIcon();
            this.DoInteraction();
        });
        this._audioSource = this.GetComponent<AudioSource>();
        this._audioSource.clip = this.audioClip;
    }

    DoInteraction(){
        this._audioSource.Play();
    }

}