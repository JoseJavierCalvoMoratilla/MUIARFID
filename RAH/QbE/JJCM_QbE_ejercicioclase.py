# José Javier Calvo Moratilla
# MUIARFID 2021-2022
# Reconocimiento del habla
# Práctica QbE

# Imports 
import numpy as np
from sys import *
from distances import get_distance_matrix
from matplotlib.pyplot import matshow, show, cm, plot
import os

def lee_fichero(fichero):
	"""
	Lee el fichero de audio .raw
	"""
	matriz=[]
	fichero=open(fichero,"r")
	lineas=fichero.readlines()
	matriz=[linea.split() for linea in lineas] 
	fichero.close()
	return np.array(matriz).astype(np.float)

print('\nSe lee el fichero corto...')
npmatriz1 = lee_fichero('./SEG-0062.mfc.raw')
print('Se lee el fichero largo...')
npmatriz2 = lee_fichero('./largo250000.mfc.raw')
print('Los ficheros han sido cargados...')
print('Se calcula la matriz de distancias...')
dist=get_distance_matrix(npmatriz1,npmatriz2,'cos')
print('Las dimensiones de la matriz de distancias son: ',dist.shape)

# npmatriz1, npmatriz2 -> vectores de características de los dos audios

def SDTW_sin_norm():
	"""
	Algoritmo que encuentra la ocurrencia de una palabra en un trozo de audio largo.
	Se almacena Coste, Longitud del camino, punto inicial del camino, en cada dimension
	de la matriz  T
	"""

 	# PRIMERA FILA
	T = np.zeros((52, 250000, 3)) 
	# Dimensiones de la matriz definida	
	len_i = T.shape[0]
	len_j = T.shape[1]

	for j in range(len_j):
	# Dim0:
		T[0, j, 0] = dist[0,j] # Coste 
	# Dim1:
		T[0, j, 1] = 1 # Longitud   
	# Dim2:
		T[0, j, 2] = j # Origen 

	# PRIMERA COLUMNA
	# Fila a fila	
	# para j=1 hasta J hacer T[0,j]=T[0,j-1]+d(0,j)
	for i in range(1,len_i):
    	# Dim0: Coste del camino	
		T[i ,0, 0] = T[i-1,0, 0] + dist[i,0]      
    	# Dim1: Longitud del camino
		T[i, 0, 1] = i
   		# Dim2: Posición inicial del camino (Origen)
		T[i, 0, 2] = 0	

	# ZONA CENTRAL
	for i in range(1,len_i):
		print('Fila: ', i, ' de: ', len_i - 1)
		for j in range(1,len_j):

			# El camino puede llegar por 3 caminos diferentes		
			val1 = (T[i-1,j, 0] + dist[i,j]) / (T[i-1,j, 1] + 1)
			val2 = (T[i,j-1, 0] + dist[i,j]) / (T[i,j-1, 1] + 1)
			val3 = (T[i-1,j-1, 0] + dist[i,j]) / (T[i-1,j-1, 1] + 1)

   			# Se obtiene el camino de menor coste
			valores = [val1, val2, val3]
			min_index = np.argmin(valores)			
			# Dim0: Coste del camino
			T[i,j, 0] = valores[min_index] + dist[i, j] 

			# Se actualiza la longitud y el punto de origen del camino de menor coste	
			# Dim1: Longitud del camino
        	# Dim2: Posición inicial
			if min_index == 0:
				T[i,j, 1] = i # Long camino  
				T[i,j, 2] = T[i-1,j, 2] # Origen
			elif min_index == 1:
				T[i,j, 1] = i # Long camino 
				T[i,j, 2] = T[i,j-1, 2] # Origen
			elif min_index == 2:
				T[i,j, 1] = i # Long camino 
				T[i,j, 2] = T[i-1,j-1, 2] # Origen

# Una vez llegada a la última fila se calcula la columna que da el menor coste	
	index_min = np.argmin(T[len_i - 1,:,0])

# Conel indice del elemento de menor coste se obtienen los siguientes resultados: 
	print('\nResultados:')
	print('##################################')
	print('El Origen es: ', T[len_i - 1, index_min ,2])
	print('El destino es: ', index_min)
	print('El coste es: ', T[len_i - 1, index_min ,0])
	print('La longitud del camino es: ', T[len_i - 1, index_min ,1])
	print('##################################\n')

SDTW_sin_norm()