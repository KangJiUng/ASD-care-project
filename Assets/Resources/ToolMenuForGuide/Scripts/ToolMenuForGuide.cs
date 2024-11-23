using UnityEditor;
using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem.UI;
using System.Reflection;

public class ToolMenuForGuide : EditorWindow
{
    private const float buttonMargin = 20f;
    private const float buttonSpacing = 10f;

    private List<Texture2D> buttonImagesUI = new List<Texture2D>();
    private List<Texture2D> buttonImagesObject = new List<Texture2D>();
    private GUIStyle labelStyle;
    private Canvas canvas;

    [MenuItem("ZEPETO/Guide/Open Tool Menu")]
    public static void ShowGuideEditor()
    {
        EditorWindow wnd = GetWindow<ToolMenuForGuide>();
        wnd.titleContent = new GUIContent("Tool menu for Guide");
    }

    [MenuItem("ZEPETO/Guide/Set Scene Environment")]
    public static void SetSceneEnvironment()
    {
        ToolMenuForGuide window = GetWindow<ToolMenuForGuide>();
        window.SetEnvironment();
    }

    private void OnEnable()
    {
        Debug.Log("OnEnable");
        buttonImagesUI = Resources.LoadAll<Texture2D>("ToolMenuForGuide/Thumbnails/UILibrary/").ToList();
        buttonImagesObject = Resources.LoadAll<Texture2D>("ToolMenuForGuide/Thumbnails/ObjectLibrary/").ToList();
    }

    private void OnGUI()
    {
        Debug.Log("OnGUI");

        SetLayOut();
    }

    private void SetLayOut()
    {
        GUILayout.Space(buttonMargin);

        SetGuideLinkStyle();

        GUILayout.Space(buttonMargin);

        if (GUILayout.Button("Set Scene Environment"))
        {
            SetEnvironment();
        }

        GUILayout.Space(buttonSpacing);

        if (GUILayout.Button("Set Vertical Canvas"))
        {
            CheckCanvas();
            SetCanvas(750, 1334, true);
        }

        GUILayout.Space(buttonSpacing);

        if (GUILayout.Button("Set Horizontal Canvas"))
        {
            CheckCanvas();
            SetCanvas(1334, 750, false);
        }

        GUILayout.Space(buttonMargin);

        SetGroupTitle("UI Library");

        GUILayout.BeginHorizontal();

        SetInstantiate(buttonImagesUI, "ToolMenuForGuide/Prefabs/UILibrary/", true);

        GUILayout.EndHorizontal();

        GUILayout.Space(buttonMargin);

        SetGroupTitle("Object Library");

        GUILayout.BeginHorizontal();

        SetInstantiate(buttonImagesObject, "ToolMenuForGuide/Prefabs/ObjectLibrary/", false);

        GUILayout.EndHorizontal();

        GUILayout.Space(buttonMargin);

    }

    private void SetGroupTitle(string titleText)
    {
        //그룹 타이틀 스타일
        GUIStyle titleStyle = new GUIStyle(GUI.skin.label);
        titleStyle.fixedWidth = 500;
        titleStyle.fontSize = 18;
        titleStyle.normal.textColor = Color.white;
        GUILayout.Label(titleText, titleStyle);
    }

    private void SetGuideLinkStyle()
    {
        GUIStyle linkStyle = new GUIStyle(GUI.skin.label);
        linkStyle.normal.textColor = new Color(100f / 255f, 175f / 255f, 255f / 255f);
        linkStyle.hover.textColor = Color.cyan;
        linkStyle.alignment = TextAnchor.UpperCenter;
        Rect linkRect = GUILayoutUtility.GetRect(new GUIContent("View Documentation"), linkStyle);

        if (GUI.Button(linkRect, "View Documentation", linkStyle))
        {
            Application.OpenURL("https://wiki.navercorp.com/pages/viewpage.action?pageId=1782856225");
        }
    }

    private void SetButtonTextStyle()
    {
        // 라벨 스타일 설정
        labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.alignment = TextAnchor.UpperCenter;
        labelStyle.fixedWidth = 100;
    }

    private void SetInstantiate(List<Texture2D> buttonImages, string prefabLocation, bool isCanvasParent)
    {

        for (int i = 0; i < buttonImages.Count; i++)
        {
            if (i > 0)
            {
                GUILayout.Space(4);
            }

            if (GUILayout.Button(buttonImages[i], GUILayout.Width(100), GUILayout.Height(100)))
            {
                string prefabName = buttonImages[i].name;
                GameObject prefab = Resources.Load<GameObject>(prefabLocation + prefabName);

                if (prefab != null)
                {
                    GameObject p = Instantiate(prefab);
                    p.name = buttonImages[i].name;

                    if (isCanvasParent)
                    {
                        CheckCanvas();
                        p.transform.SetParent(canvas.transform, false);
                    }
                }
                else
                {
                    Debug.LogError("Prefab not found: " + prefabName);
                }
            }

            // if (!isCanvasParent)
            // {
            //     SetButtonTextStyle();
            //     GUILayout.Label(buttonImages[i].name, labelStyle);
            // }
        }

    }

    //씬의 라이팅 스카이박스, 렌더세팅 설정
    private void SetEnvironment()
    {
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(193 / 255f, 213 / 255f, 229 / 255f);
        Light defaultLight = FindObjectOfType<Light>();

        if (defaultLight != null)
        {
            defaultLight.transform.rotation = Quaternion.Euler(150.64f, 23.564f, -249.21f);
            Light light = defaultLight.GetComponent<Light>();
            light.color = Color.white;
            light.intensity = 0.85f;
            light.shadows = LightShadows.Soft;
            light.shadowStrength = 0.6f;
            light.shadowResolution = UnityEngine.Rendering.LightShadowResolution.VeryHigh;
            light.shadowBias = 0.027f;
            light.shadowNormalBias = 0f;
            light.shadowNearPlane = 0.1f;
        }
        else
        {
            Debug.LogWarning("Directional Light를 찾을 수 없습니다.");
        }

        Material skyboxMaterial = Resources.Load<Material>("ToolMenuForGuide/Materials/Skybox");
        if (skyboxMaterial != null)
        {
            RenderSettings.skybox = skyboxMaterial;
        }
        else
        {
            Debug.LogError("Skybox Material not found.");
        }

        Debug.Log("SetEnvironment");
    }


    private void CheckCanvas()
    {
        canvas = FindObjectOfType<Canvas>();

        if (canvas == null)
        {
            GameObject canvasObject = new GameObject("Canvas");
            canvas = canvasObject.AddComponent<Canvas>();
            canvasObject.AddComponent<CanvasScaler>();
            canvasObject.AddComponent<GraphicRaycaster>();
        }
    }

    private void SetCanvas(int width, int height, bool isVertical)
    {
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        CanvasScaler canvasScaler = canvas.GetComponent<CanvasScaler>();
        if (canvasScaler != null)
        {
            canvasScaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            canvasScaler.referenceResolution = new Vector2(width, height);
            canvasScaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;

            if (isVertical)
            {
                canvasScaler.matchWidthOrHeight = 0f;
            }
            else
            {
                canvasScaler.matchWidthOrHeight = 1f;
            }
        }

        EventSystem eventSystem = FindObjectOfType<EventSystem>();

        if (eventSystem == null)
        {
            GameObject eventSystemObject = new GameObject("EventSystem");
            eventSystem = eventSystemObject.AddComponent<EventSystem>();
        }

        StandaloneInputModule standaloneInputModule = FindObjectOfType<StandaloneInputModule>();

        if (standaloneInputModule != null)
        {
            DestroyImmediate(standaloneInputModule);
        }
        eventSystem.gameObject.AddComponent<InputSystemUIInputModule>();
    }
}
