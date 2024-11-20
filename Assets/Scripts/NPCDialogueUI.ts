import { GameObject, TextAsset, Collider, Resources } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { TMP_Text } from 'TMPro';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";

// JSON 데이터 구조 정의
interface Dialogue {
    id: number;
    text: string;
    options: string[] | null;
}

export default class DialogueManager extends ZepetoScriptBehaviour {

    public dialogueCanvas: GameObject; // 대화 UI 전체
    public dialogueText: TMP_Text;     // 대화 텍스트
    public choiceButtons: Button[];   // 선택지 버튼 배열

    private _dialogues: Dialogue[] = []; // JSON 데이터에서 가져온 대화 배열
    private _currentDialogueIndex: number = 0; // 현재 대화 인덱스
    private _isInCollider: boolean = false; // Collider 안에 있는지 여부
    private _zepetoCharacter: ZepetoCharacter;

    Start() {
        // Zepeto 플레이어 초기화
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            console.log("Player character initialized.");
        });

        // JSON 데이터 로드
        const jsonFile: TextAsset = Resources.Load<TextAsset>("dialogues"); // Resources/dialogues.json
        if (jsonFile) {
            const data = JSON.parse(jsonFile.text);
            this._dialogues = data.dialogues;
        } else {
            console.error("Failed to load JSON file. Ensure the file is in the Resources folder.");
            return;
        }

        // UI 초기화
        this.HideUI();

        // 선택지 버튼 클릭 이벤트 설정
        for (let i = 0; i < this.choiceButtons.length; i++) {
            const buttonIndex = i; // 로컬 변수로 버튼 인덱스 고정
            this.choiceButtons[i].onClick.AddListener(() => this.OnChoiceSelected(buttonIndex));
        }
    }

    OnTriggerEnter(collider: Collider) {
        if (this._zepetoCharacter && collider.gameObject === this._zepetoCharacter.gameObject) {
            console.log("Player entered NPC zone.");
            this._isInCollider = true;
            this.ShowUI();
        }
    }

    OnTriggerExit(collider: Collider) {
        if (this._zepetoCharacter && collider.gameObject === this._zepetoCharacter.gameObject) {
            console.log("Player exited NPC zone.");
            this._isInCollider = false;
            this.HideUI();
        }
    }

    private ShowUI() {
        if (!this._isInCollider) return; // Collider 내부에서만 UI 표시
        this.UpdateDialogue();
        this.dialogueCanvas.SetActive(true);
    }

    private HideUI() {
        console.log("Hiding UI...");
        this.dialogueCanvas.SetActive(false);
    }

    private UpdateDialogue() {
        if (this._currentDialogueIndex >= this._dialogues.length) {
            console.log("End of dialogues.");
            this.HideUI();
            return;
        }

        const currentDialogue = this._dialogues[this._currentDialogueIndex];

        // 대화 텍스트 업데이트
        this.dialogueText.text = currentDialogue.text;

        // 선택지 버튼 업데이트
        if (currentDialogue.options && currentDialogue.options.length > 0) {
            this.ShowChoices(currentDialogue.options);
        } else {
            this.HideChoices();
        }
    }

    private ShowChoices(choices: string[]) {
        this.HideChoices(); // 기존 버튼 초기화

        for (let i = 0; i < choices.length; i++) {
            if (i < this.choiceButtons.length) {
                this.choiceButtons[i].gameObject.SetActive(true);
                this.choiceButtons[i].GetComponentInChildren<TMP_Text>().text = choices[i];
            }
        }
    }

    private HideChoices() {
        for (const button of this.choiceButtons) {
            button.gameObject.SetActive(false);
        }
    }

    private OnChoiceSelected(choiceIndex: number) {
        console.log(`Choice ${choiceIndex + 1} selected.`);
        this._currentDialogueIndex++; // 다음 대화로 진행
        this.UpdateDialogue();
    }
}
