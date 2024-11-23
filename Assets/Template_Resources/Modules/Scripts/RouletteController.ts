import { Coroutine, GameObject, Mathf, Object, Random, Time, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoPlayers, ZepetoCharacter } from "ZEPETO.Character.Controller";
import InteractionIcon from '../Interaction/ZepetoScript/InteractionIcon';
import { RawImage, Text } from 'UnityEngine.UI';
import { ZepetoChat } from 'ZEPETO.Chat';

export default class RouletteController extends ZepetoScriptBehaviour {

    public minNumber: number = 0;
    public maxNumber: number = 10;


    private Start() {

        const interactionIcons = this.GetComponentInChildren<InteractionIcon>();

        interactionIcons.OnClickEvent.AddListener(() => {
            this.OnClickIcon();
        });


    }

    private OnClickIcon() {
        
        const random = Mathf.Floor(Random.Range( this.minNumber, this.maxNumber));

        ZepetoChat.Send("The player drew the number : " + random.toString());        
    }
}