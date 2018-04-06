# TechDegree

## Résumé
Le but de ce projet est de créer une IA qui a pour objectif d'apprendre à jouer à plusieurs jeux vidéo. Il implémente des principes du Machine learning tel que les réseaux de neurones, ainsi que les algorithmes génétiques.

Un réseau de neurones de type supervised permettra de créer la structure du cerveau de l'IA, alors que les algorithmes génétiques permettront de l'entraîner. Chaque cerveau sera envoyé dans une simulation d'un jeu et obtiendra un score lorsqu'il meurt. Ce score sera utilisé pour déterminer lesquels sélectionner et "reproduire" entre eux pour ainsi donner des cerveaux plus "intelligent".

le réseau de neurones prend des valeurs normalisées du jeu en entrée, puis, les valeurs d'entrées ainsi que des "poids" (chiffres) passent dans des fonctions mathématiques pour déterminer l'action à effectuer. Une fois que chaque réseau a été utilisé dans une simulation, on prend ceux qui ont le plus gros score pour interchanger leur "poids" et les modifier légèrement. Ces opérations sont répétées infiniment.

Ce projet permet d'ajouter des jeux en renseignant quelques valeurs et obtient de très bon score sur les jeux déjà implémentés.

## Abstract
The purpose of this project is to create an Artificial intelligence that aims to learn to play several video games. It implements some principles of Machine learning such as neural networks, as well as genetic algorithms.

A neural network of the supervised type will allow the creation of the structure of the brain used by the Artificial intelligence, while the genetic algorithm will train it. Each brain will run in a simulation of a game and will get a score when the game ends. This score will be used to select the best brains. Those brains will then reproduce and "crossover", thus merging and mixing values.

The neural network takes normalized values and inputs from the game as well as "weights" that pass into mathematical functions. Those functions determine what action to make. Once each neural network has been used in a simulation, we take the ones with the biggest score to interchange their "weight" and modify them slightly. Thoses operations are repeated infinitely.

This project allows to add new games by refering some values and gets a very good score on the games already implemented.

link to test the project : https://lorisdebiasi.github.io/TrexCeptional-TechDegree/source/
