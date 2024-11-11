import { BoxCollider, GameObject, Object, Vector3 } from 'UnityEngine';
import { CharacterState, ZepetoCharacter, ZepetoPlayer, ZepetoPlayers, ZepetoScreenButton } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import TeleportArea from './TeleportArea';

export default class SceneManager extends ZepetoScriptBehaviour {


    @Header("Character Settings")

    @Tooltip("Adjust the walking speed of the ZEPETO character. The default value is 2.")
    public walkSpeed: number = 2;

    @Tooltip("Adjust the running speed of the ZEPETO character. The default value is 5.")
    public runSpeed: number = 5;

    @Tooltip("Set the standard jump power. The default value is 13.")
    public jumpPower: number = 13;

    @Tooltip("When this property is enabled, the ZEPETO character can perform a double jump.")
    public enableDoubleJump: bool = false;

    @Tooltip("Set the jump power for the double jump. The default value is 13.")
    public doubleJumpPower: number = 13;


    @Header("Scene Settings")

    @Tooltip("Set the ground height at which the ZEPETO character will return to the spawn location when falling. Otherwise, the character may fall indefinitely. This value can be set between -100 and -500.")
    public fallAreaPosition: number = -500;

    private zepetoCharacter: ZepetoCharacter;


    Start() {
        this.SetTeleportArea();

        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            this.SetCharacterSettings();
            this.SetDoubleJump();
        });
    }

    private SetTeleportArea() {
        const cube = new GameObject;
        const clampPosition = Math.max(-500, Math.min(this.fallAreaPosition, -100));
        cube.transform.position = new Vector3(0, clampPosition, 0);
        const col = cube.AddComponent<BoxCollider>();
        col.isTrigger = true;
        col.size = new Vector3(5000, 50, 5000);
        cube.AddComponent<TeleportArea>();
    }

    private SetCharacterSettings(){
        
        this.zepetoCharacter.additionalJumpPower = this.jumpPower - this.zepetoCharacter.JumpPower;
        this.zepetoCharacter.additionalWalkSpeed = this.walkSpeed - this.zepetoCharacter.WalkSpeed;
        this.zepetoCharacter.additionalRunSpeed = this.runSpeed - this.zepetoCharacter.RunSpeed;
    }

    private SetDoubleJump() {

        if (!this.enableDoubleJump) {
            return;
        }

        this.zepetoCharacter.motionState.doubleJumpPower = this.doubleJumpPower;

        // Find an object of type ZepetoScreenButton in the scene
        const screenButton = Object.FindObjectOfType<ZepetoScreenButton>();

        // Add a listener for the OnPointDownEvent of the screen button to handle jump actions
        screenButton.OnPointDownEvent.AddListener(() => {

            // If the character's current state is Jump, trigger a double jump
            if (this.zepetoCharacter.CurrentState === CharacterState.Jump) {
                this.zepetoCharacter.DoubleJump();
            }
        });
    }
}