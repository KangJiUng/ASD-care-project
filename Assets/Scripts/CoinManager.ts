import { PlayerPrefs } from 'UnityEngine';

export default class CoinManager {
    private static instance: CoinManager;
    private coins: number = 0;

    // ���� ���� �̺�Ʈ
    public OnCoinsChanged: (newCoins: number) => void = null;

    private constructor() {
        // PlayerPrefs���� ���� ���� �� �ε�
        this.coins = PlayerPrefs.GetInt("Coins", 0);
    }

    public static get Instance(): CoinManager {
        if (!this.instance) {
            this.instance = new CoinManager();
        }
        return this.instance;
    }

    public GetCoins(): number {
        return this.coins;
    }

    public AddCoins(amount: number): void {
        this.coins += amount;
        this.SaveCoins();
        this.NotifyCoinsChanged(); // ���� ���� �˸�
    }

    public SubtractCoins(amount: number): boolean {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.SaveCoins();
            this.NotifyCoinsChanged(); // ���� ���� �˸�
            return true; // ���������� ����
        }
        return false; // ������ ������ ���
    }

    private SaveCoins(): void {
        PlayerPrefs.SetInt("Coins", this.coins);
        PlayerPrefs.Save();
    }

    private NotifyCoinsChanged(): void {
        if (this.OnCoinsChanged) {
            this.OnCoinsChanged(this.coins); // �̺�Ʈ ȣ��
        }
    }
}
