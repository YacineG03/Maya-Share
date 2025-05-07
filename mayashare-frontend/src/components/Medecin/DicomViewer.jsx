"use client"

import { useEffect, useRef, useState } from "react"
import * as cornerstone from "cornerstone-core"
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader"
import * as cornerstoneTools from "cornerstone-tools"
import * as cornerstoneMath from "cornerstone-math"
import dicomParser from "dicom-parser"
import Hammer from "hammerjs"

// Initialiser les dépendances externes
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.external.Hammer = Hammer

// Initialiser Cornerstone WADO Image Loader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.dicomParser = dicomParser

// Initialiser les outils
cornerstoneTools.init({
  mouseEnabled: true,
  touchEnabled: true,
  globalToolSyncEnabled: false,
  showSVGCursors: true,
})

const DicomViewer = ({ dicomWebUrl }) => {
  const elementRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTool, setActiveTool] = useState("Wwwc") // Outil de fenêtrage par défaut
  const [imageLoaded, setImageLoaded] = useState(false)

  // Liste des outils disponibles pour la désactivation explicite
  const toolList = ["Wwwc", "Pan", "Zoom", "Rotate", "Length", "Angle", "Magnify"]

  // Fonction pour activer un outil
  const activateTool = (toolName) => {
    if (!imageLoaded) return

    const element = elementRef.current

    // Désactiver tous les outils actifs explicitement
    toolList.forEach((tool) => {
      try {
        cornerstoneTools.setToolDisabled(tool)
      } catch (error) {
        console.warn(`Impossible de désactiver l'outil ${tool}:`, error)
      }
    })

    // Cas spécial pour l'outil de réinitialisation
    if (toolName === "Reset") {
      if (element) {
        cornerstone.reset(element)
        // Réactiver l'outil de fenêtrage par défaut
        try {
          cornerstoneTools.setToolActive("Wwwc", { mouseButtonMask: 1 })
          setActiveTool("Wwwc")
        } catch (error) {
          console.error("Erreur lors de la réactivation de l'outil Wwwc:", error)
        }
      }
      return
    }

    // Activer l'outil sélectionné
    try {
      cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 })
      setActiveTool(toolName)
      console.log(`Outil activé: ${toolName}`)
    } catch (error) {
      console.error(`Erreur lors de l'activation de l'outil ${toolName}:`, error)
    }
  }

  // Fonction pour appliquer un fenêtrage automatique
  const applyAutoWindow = () => {
    if (!imageLoaded) return

    const element = elementRef.current
    if (element) {
      try {
        const viewport = cornerstone.getViewport(element)
        const image = cornerstone.getImage(element)

        if (image) {
          // Calculer les valeurs optimales de fenêtrage basées sur l'histogramme de l'image
          const maxVoi = image.maxPixelValue || 1000
          const minVoi = image.minPixelValue || 0

          viewport.voi.windowWidth = maxVoi - minVoi
          viewport.voi.windowCenter = (maxVoi + minVoi) / 2

          cornerstone.setViewport(element, viewport)
          cornerstone.updateImage(element)
          console.log("Auto fenêtrage appliqué:", viewport.voi)
        }
      } catch (error) {
        console.error("Erreur lors de l'application de l'auto fenêtrage:", error)
      }
    }
  }

  useEffect(() => {
    if (!dicomWebUrl) {
      setError("Erreur: dicomWebUrl est vide ou non défini")
      return
    }

    setIsLoading(true)
    setError(null)
    setImageLoaded(false)

    console.log("Tentative de chargement de l'image DICOM:", dicomWebUrl)

    // Activer l'élément pour Cornerstone
    const element = elementRef.current

    try {
      cornerstone.enable(element)

      // Ajouter les outils à l'élément
      cornerstoneTools.addTool(cornerstoneTools.WwwcTool)
      cornerstoneTools.addTool(cornerstoneTools.PanTool)
      cornerstoneTools.addTool(cornerstoneTools.ZoomTool)
      cornerstoneTools.addTool(cornerstoneTools.RotateTool)
      cornerstoneTools.addTool(cornerstoneTools.LengthTool)
      cornerstoneTools.addTool(cornerstoneTools.AngleTool)
      cornerstoneTools.addTool(cornerstoneTools.MagnifyTool)

      // Activer l'outil de fenêtrage par défaut
      cornerstoneTools.setToolActive("Wwwc", { mouseButtonMask: 1 })

      // Charger et afficher l'image DICOM
      cornerstone.loadImage(dicomWebUrl).then(
        (image) => {
          console.log("Image DICOM chargée avec succès:", image)
          cornerstone.displayImage(element, image)

          // Ajuster les niveaux de fenêtre pour s'assurer que l'image est visible
          const viewport = cornerstone.getDefaultViewportForImage(element, image)
          viewport.voi.windowWidth = image.windowWidth || 256
          viewport.voi.windowCenter = image.windowCenter || 128
          console.log("Niveaux de fenêtre appliqués:", viewport.voi)
          cornerstone.setViewport(element, viewport)
          cornerstone.updateImage(element)

          setIsLoading(false)
          setImageLoaded(true)

          // Ajouter des gestionnaires d'événements pour les interactions de la souris
          element.addEventListener("cornerstoneimagerendered", (e) => {
            console.log("Image rendue", e)
          })

          element.addEventListener("cornerstonetoolsmousedown", (e) => {
            console.log("Souris enfoncée", e)
          })
        },
        (error) => {
          console.error("Erreur lors du chargement de l'image DICOM:", error)
          setError("Erreur lors du chargement de l'image DICOM: " + error.message)
          setIsLoading(false)
        },
      )
    } catch (error) {
      console.error("Erreur lors de l'initialisation de Cornerstone:", error)
      setError("Erreur lors de l'initialisation de Cornerstone: " + error.message)
      setIsLoading(false)
    }

    // Nettoyer lors du démontage du composant
    return () => {
      try {
        if (element) {
          // Désactiver tous les outils explicitement
          toolList.forEach((tool) => {
            try {
              cornerstoneTools.setToolDisabled(tool)
            } catch (error) {
              console.warn(`Impossible de désactiver l'outil ${tool} lors du nettoyage:`, error)
            }
          })

          // Désactiver cornerstone
          cornerstone.disable(element)
        }
      } catch (error) {
        console.error("Erreur lors du nettoyage:", error)
      }
    }
  }, [dicomWebUrl])

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      {/* Barre d'outils */}
      <div
        style={{
          display: "flex",
          padding: "8px",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px 4px 0 0",
          overflowX: "auto",
          gap: "4px",
        }}
      >
        <button
          onClick={() => activateTool("Wwwc")}
          style={{
            padding: "6px 12px",
            backgroundColor: activeTool === "Wwwc" ? "#0077B6" : "#ffffff",
            color: activeTool === "Wwwc" ? "#ffffff" : "#333333",
            border: "1px solid #dddddd",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <span>🔆</span>
          <span>Fenêtrage</span>
        </button>

        <button
          onClick={() => activateTool("Pan")}
          style={{
            padding: "6px 12px",
            backgroundColor: activeTool === "Pan" ? "#0077B6" : "#ffffff",
            color: activeTool === "Pan" ? "#ffffff" : "#333333",
            border: "1px solid #dddddd",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <span>✋</span>
          <span>Déplacer</span>
        </button>

        <button
          onClick={() => activateTool("Zoom")}
          style={{
            padding: "6px 12px",
            backgroundColor: activeTool === "Zoom" ? "#0077B6" : "#ffffff",
            color: activeTool === "Zoom" ? "#ffffff" : "#333333",
            border: "1px solid #dddddd",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <span>🔍</span>
          <span>Zoom</span>
        </button>

        <button
          onClick={() => activateTool("Rotate")}
          style={{
            padding: "6px 12px",
            backgroundColor: activeTool === "Rotate" ? "#0077B6" : "#ffffff",
            color: activeTool === "Rotate" ? "#ffffff" : "#333333",
            border: "1px solid #dddddd",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <span>🔄</span>
          <span>Rotation</span>
        </button>

        <button
          onClick={() => activateTool("Length")}
          style={{
            padding: "6px 12px",
            backgroundColor: activeTool === "Length" ? "#0077B6" : "#ffffff",
            color: activeTool === "Length" ? "#ffffff" : "#333333",
            border: "1px solid #dddddd",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <span>📏</span>
          <span>Mesure</span>
        </button>

        <button
          onClick={() => activateTool("Angle")}
          style={{
            padding: "6px 12px",
            backgroundColor: activeTool === "Angle" ? "#0077B6" : "#ffffff",
            color: activeTool === "Angle" ? "#ffffff" : "#333333",
            border: "1px solid #dddddd",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <span>📐</span>
          <span>Angle</span>
        </button>

        <button
          onClick={() => activateTool("Magnify")}
          style={{
            padding: "6px 12px",
            backgroundColor: activeTool === "Magnify" ? "#0077B6" : "#ffffff",
            color: activeTool === "Magnify" ? "#ffffff" : "#333333",
            border: "1px solid #dddddd",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <span>🔎</span>
          <span>Loupe</span>
        </button>

        <button
          onClick={() => activateTool("Reset")}
          style={{
            padding: "6px 12px",
            backgroundColor: "#ffffff",
            color: "#333333",
            border: "1px solid #dddddd",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <span>🔄</span>
          <span>Réinitialiser</span>
        </button>

        <button
          onClick={applyAutoWindow}
          style={{
            padding: "6px 12px",
            backgroundColor: "#ffffff",
            color: "#333333",
            border: "1px solid #dddddd",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <span>🔄</span>
          <span>Auto Fenêtrage</span>
        </button>
      </div>

      {/* Conteneur de l'image */}
      <div style={{ position: "relative", flex: 1, backgroundColor: "black", borderRadius: "0 0 4px 4px" }}>
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              zIndex: 10,
            }}
          >
            Chargement de l'image DICOM...
          </div>
        )}

        {error && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              zIndex: 10,
            }}
          >
            {error}
          </div>
        )}

        <div
          ref={elementRef}
          style={{ width: "100%", height: "100%", minHeight: "400px" }}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {/* Instructions d'utilisation */}
      <div
        style={{
          padding: "8px",
          backgroundColor: "#f0f0f0",
          borderRadius: "0 0 4px 4px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>Instructions:</strong> Sélectionnez un outil puis cliquez et faites glisser sur l'image pour
          l'utiliser. Pour le zoom, faites glisser vers le haut pour agrandir, vers le bas pour réduire.
        </p>
        <p style={{ margin: "4px 0 0 0" }}>
          <strong>Débogage:</strong> Si les outils ne fonctionnent pas, vérifiez la console du navigateur pour les
          erreurs.
        </p>
      </div>
    </div>
  )
}

export default DicomViewer
