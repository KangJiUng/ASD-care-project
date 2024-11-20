import { GameObject, Quaternion, Transform, Vector3 } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { AdShowResult, WorldAdvertisement } from 'ZEPETO.Advertisement.General';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';

const AD_KEY: string = "Monetize_Template";

export default class AdvertisementManager extends ZepetoScriptBehaviour {

    @HideInInspector() destinationPosiiton: Vector3;
    @HideInInspector() destinationRotation: Quaternion;

    // Singleton declaration
    private static instance: AdvertisementManager = null;

    public static get Instance(): AdvertisementManager {
        if (this.instance == null) {
            this.instance = GameObject.FindObjectOfType<AdvertisementManager>();
        }

        return this.instance;
    }

    public ReWardTeleport(position: Vector3, rotation: Quaternion) {
        this.destinationPosiiton = position;
        this.destinationRotation = rotation;
        this.ShowAd(this.rewardTeleport);
    }

    rewardTeleport() {
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(this.destinationPosiiton, this.destinationRotation);
    }

    // Method to show an advertisement and specify a reward function to call upon ad completion
    ShowAd(rewardFunction: () => void) {
        WorldAdvertisement.Show(
            AD_KEY, // Using the defined advertisement key
            result => this.rewardTeleport()
                //this.OnAdShowResult(result, rewardFunction) // Handling the ad result and specifying the reward function
        );
    }

    // Method to handle the result of the advertisement show
    OnAdShowResult(result: AdShowResult, rewardFunction: () => void) {
        if (result === AdShowResult.Finished) {
            // If the ad was successfully watched to completion
            console.log("Ad show successful; Finished.");
            rewardFunction(); // Call the specified reward function
            return;
        }

        // Variable to store the failure message
        let failMessage: string;
        // Determine the appropriate failure message based on the ad result
        switch (result) {
            case AdShowResult.Failed:
                failMessage = "Failed";
                break;
            case AdShowResult.Skipped:
                failMessage = "Skipped";
                break;
            case AdShowResult.NotReady:
                failMessage = "NotReady";
                break;
            default:
                failMessage = "Unknown result";
                break;
        }
        // Log the failure message
        console.log(`Ad show failed; ${failMessage}.`);
    }
}
