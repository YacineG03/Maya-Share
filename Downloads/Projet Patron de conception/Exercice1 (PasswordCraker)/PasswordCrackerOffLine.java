import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

// Interface pour la méthode de craquage de mot de passe
interface PasswordCracker {
    void crackPassword(String password);
}

// Fabrique pour créer des instances de méthodes de craquage de mot de passe
class PasswordCrackerFactory {
    static PasswordCracker createCracker(String type) {
        if (type.equalsIgnoreCase("dictionary")) {
            return new OfflineDictionaryCracker();
        } else if (type.equalsIgnoreCase("bruteforce")) {
            return new BruteForceCracker();
        }
        return null;
    }
}

// Classe pour la méthode de craquage de mot de passe utilisant un dictionnaire
class OfflineDictionaryCracker implements PasswordCracker {
    public void crackPassword(String password) {
        try {
            // Calculer le hash du mot de passe fourni
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(password.getBytes());
            StringBuilder hashBuilder = new StringBuilder();
            for (byte b : hashBytes) {
                hashBuilder.append(String.format("%02x", b));
            }
            String hash = hashBuilder.toString();

            // Chemin vers le fichier du dictionnaire
            String dictionaryPath = "/Users/assietoudrame/Downloads/1000-mdp.txt";

            // Commande Hashcat pour craquer le mot de passe
            String command = String.format("hashcat -a 0 -m 0 %s %s", hash, dictionaryPath);

            // Exécution de la commande
            Process process = Runtime.getRuntime().exec(command);

            // Lecture de la sortie du processus
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line); // Afficher la sortie de Hashcat
            }

            // Attendre que le processus se termine et obtenir le code de sortie
            int exitCode = process.waitFor();
            System.out.println("Hashcat a terminé avec le code de sortie : " + exitCode);

        } catch (IOException | InterruptedException | NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
    }
}

// Classe pour la méthode de craquage de mot de passe par force brute
class BruteForceCracker implements PasswordCracker {
    public void crackPassword(String password) {
        int longueurMaximale = 6; // Longueur maximale du mot de passe à tester
        bruteForce(password, longueurMaximale);
    }

    // Méthode pour effectuer une attaque par force brute
    private void bruteForce(String motDePasse, int longueurMaximale) {
        char[] caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".toCharArray();

        // Boucle pour la longueur du mot de passe
        for (int longueur = 1; longueur <= longueurMaximale; longueur++) {
            // Génération de toutes les combinaisons possibles de la longueur actuelle
            generate("", caracteres, longueur, motDePasse);
        }
    }

    // Méthode récursive pour générer les combinaisons de caractères
    private void generate(String base, char[] caracteres, int longueur, String motDePasse) {
        if (longueur == 0) {
            // Si la longueur désirée est atteinte, tester la combinaison
            if (base.equals(motDePasse)) {
                System.out.println("Mot de passe craqué : " + base);
                System.exit(0); // Arrêter le programme après avoir trouvé le mot de passe
            }
            return;
        }

        for (int i = 0; i < caracteres.length; i++) {
            // Appel récursif pour générer les combinaisons suivantes
            String newBase = base + caracteres[i];
            generate(newBase, caracteres, longueur - 1, motDePasse);
        }
    }
}

public class PasswordCrackerOffLine {
    public static void main(String[] args) {
        // Utilisation de la fabrique pour créer un craqueur de mot de passe par dictionnaire
        PasswordCracker dictionaryCracker = PasswordCrackerFactory.createCracker("dictionary");
        if (dictionaryCracker != null) {
            System.out.println("Crack de mot de passe par dictionnaire :");
            // Remplacez le hash MD5 par celui du mot de passe que vous souhaitez craquer
            dictionaryCracker.crackPassword("password"); // Hash MD5 pour "password"
        }

        // Utilisation de la fabrique pour créer un craqueur de mot de passe par force brute
        PasswordCracker bruteForceCracker = PasswordCrackerFactory.createCracker("bruteforce");
        if (bruteForceCracker != null) {
            System.out.println("\nCrack de mot de passe par force brute :");
            bruteForceCracker.crackPassword("m");
        }
    }
}
