import { Animator, Collider } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class SwimObjectController extends ZepetoScriptBehaviour {

    private localPlayerCollider: Collider;
    private _anim: Animator;
    private _isSwimming: bool;

    private Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.localPlayerCollider = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.GetComponent<Collider>();
            this._anim = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator;
        });
    }

    private OnTriggerEnter(coll: Collider) {
        console.log("OnTriggerEnter");
        if (coll != this.localPlayerCollider) {
            return;
        }
        this._isSwimming = true;
        //this._anim.SetInteger("State", 17);
    }

    private OnTriggerExit(coll: Collider) {
        console.log("OnTriggerExit");
        if (coll != this.localPlayerCollider) {
            return;
        }
        this._isSwimming = false;
    }

    private Update(){
        this._anim.SetBool("isSwim", this._isSwimming);
    }

}