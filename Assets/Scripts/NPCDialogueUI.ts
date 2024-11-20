import { GameObject, TextAsset, Collider, Resources } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { TMP_Text } from 'TMPro';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";

// JSON ������ ���� ����
interface Dialogue {
    id: number;
    text: string;
    options: string[] | null;
}

export default class DialogueManager extends ZepetoScriptBehaviour {

    public dialogueCanvas: GameObject; // ��ȭ UI ��ü
    public dialogueText: TMP_Text;     // ��ȭ �ؽ�Ʈ
    public choiceButtons: Button[];   // ������ ��ư �迭

    private _dialogues: Dialogue[] = []; // JSON �����Ϳ��� ������ ��ȭ �迭
    private _currentDialogueIndex: number = 0; // ���� ��ȭ �ε���
    private _isInCollider: boolean = false; // Collider �ȿ� �ִ��� ����
    private _zepetoCharacter: ZepetoCharacter;

    Start() {
        // Zepeto �÷��̾� �ʱ�ȭ
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            console.log("Player character initialized.");
        });

        // JSON ������ �ε�
        const jsonFile: TextAsset = Resources.Load<TextAsset>("dialogues"); // Resources/dialogues.json
        if (jsonFile) {
            const data = JSON.parse(jsonFile.text);
            this._dialogues = data.dialogues;
        } else {
            console.error("Failed to load JSON file. Ensure the file is in the Resources folder.");
            return;
        }

        // UI �ʱ�ȭ
        this.HideUI();

        // ������ ��ư Ŭ�� �̺�Ʈ ����
        for (let i = 0; i < this.choiceButtons.length; i++) {
            const buttonIndex = i; // ���� ������ ��ư �ε��� ����
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
        if (!this._isInCollider) return; // Collider ���ο����� UI ǥ��
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

        // ��ȭ �ؽ�Ʈ ������Ʈ
        this.dialogueText.text = currentDialogue.text;

        // ������ ��ư ������Ʈ
        if (currentDialogue.options && currentDialogue.options.length > 0) {
            this.ShowChoices(currentDialogue.options);
        } else {
            this.HideChoices();
        }
    }

    private ShowChoices(choices: string[]) {
        this.HideChoices(); // ���� ��ư �ʱ�ȭ

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
        this._currentDialogueIndex++; // ���� ��ȭ�� ����
        this.UpdateDialogue();
    }
}
