public class ExplorateurFichier
{
	public static void main(String[] args)
	{
		Fichier fichier1 = new Fichier("main", "java", 1024);
		Fichier fichier2 = new Fichier("calculer", "java", 2048);
		Fichier fichier3 = new Fichier("globe", "png", 1428);
		Fichier fichier4 = new Fichier("mane", "jpg", 148);
		Fichier fichier5 = new Fichier("gawlo", "mp3", 1248);
		Fichier fichier6 = new Fichier("lucky", "wmv", 1248);
		Fichier fichier7 = new Fichier("AMADEUS", "mp3", 1248);
		Fichier fichier8 = new Fichier("avatar", "wmv", 1248);
		Fichier fichier9 = new Fichier("wally", "mp3", 1248);
		Fichier fichier10 = new Fichier("harry potter", "wmv", 1248);

		Dossier dossier1 = new Dossier("Music");
		dossier1.ajouter(fichier1);
		dossier1.ajouter(fichier2);
		dossier1.ajouter(fichier5);
		dossier1.ajouter(fichier6);
		Dossier dossier2 = new Dossier("Images");
		dossier2.ajouter(fichier3);
		dossier2.ajouter(fichier4);
		dossier2.ajouter(fichier7);
		dossier2.ajouter(fichier8);
		Dossier dossier3 = new Dossier("Desktop");
		dossier3.ajouter(dossier1);
		dossier3.ajouter(dossier2);

		Composant dossier[] = {
			dossier3,fichier9,fichier10
		};

		for (Composant composant : dossier) {
			composant.afficher();
		}
	}
}
