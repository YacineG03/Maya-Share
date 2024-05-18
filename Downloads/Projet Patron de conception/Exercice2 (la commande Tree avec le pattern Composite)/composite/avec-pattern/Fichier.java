public class Fichier extends Composant {
    private String nom, extension;
    private int taille;

    public Fichier(String nom, String extension, int taille) {
        this.nom = nom;
        this.extension = extension;
        this.setTaille(taille);
    }

    public String getNom() {
        return nom;
    }

    public String getExtension() {
        return extension;
    }

    public int getTaille() {
        return taille;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setExtension(String extension) {
        this.extension = extension;
    }

    public void setTaille(int taille) {
        if (taille >= 0) {
            this.taille = taille;
        } else {
            System.err.println("Erreur: taille incorrecte");
        }
    }

    @Override
    public void afficher() {
        afficherDetails();
    }

   
    public void afficherNom(String prefix) {
        System.out.printf("%s|--  %s.%s\n", prefix, this.nom, this.extension);
    }

    public void afficherDetails() {
        System.out.printf(" %s.%s    \n", this.nom, this.extension);
    }
}
