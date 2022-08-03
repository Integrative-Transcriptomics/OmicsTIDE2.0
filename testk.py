import math

from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_samples, silhouette_score

import matplotlib.pyplot as plt
import matplotlib.cm as cm
import numpy as np
import pandas as pd
import sys
import os


def best_k_plots(X, name):
    """
    Tests different k with silhouette and ellbow method and creats plots.
    Parameters:
        X (pandas dataframe): A pandas data frame with the data
        name (string): The path were to save the file
    """
    X = X.to_numpy(copy=True)
    sse = []
    silhouette_scores = []
    used_k = []
    max = 11
    if len(X) > 1:
        fig, axs = plt.subplots(6, 2)
        fig.set_size_inches(10, 30)
        if len(X) < max:
            max = len(X)
        for k in range(1, max):
            kmeans = KMeans(n_clusters=k)
            cluster_labels = kmeans.fit_predict(X)
            # ellbow method
            sse.append(kmeans.inertia_)
            # silhouette
            if len(set(cluster_labels)) > 1:
                used_k.append(k)
                silhouette_avg = silhouette_score(X, cluster_labels)
                silhouette_scores.append(silhouette_avg)

                sample_silhouette_values = silhouette_samples(X, cluster_labels)
                ax_sil = axs[math.floor(k / 2), k % 2]
                ax_sil.set_xlim([-0.1, 1])
                ax_sil.set_ylim([0, len(X) + (k + 1) * 10])
                y_lower = 10

                # silhouette coefficient plots
                for i in range(k):
                    ith_cluster_silhouette_values = sample_silhouette_values[cluster_labels == i]
                    ith_cluster_silhouette_values.sort()
                    size_cluster_i = ith_cluster_silhouette_values.shape[0]
                    y_upper = y_lower + size_cluster_i
                    color = cm.nipy_spectral(float(i) / k)
                    ax_sil.fill_betweenx(
                        np.arange(y_lower, y_upper),
                        0,
                        ith_cluster_silhouette_values,
                        facecolor=color,
                        edgecolor=color,
                        alpha=0.7,
                    )
                    ax_sil.text(-0.05, y_lower + 0.5 * size_cluster_i, str(i))
                    y_lower = y_upper + 10  # 10 for the 0 samples

                ax_sil.set_title("k=" + str(k))
                ax_sil.set_xlabel("Silhouette coefficient")
                ax_sil.set_ylabel("Cluster label")

                ax_sil.axvline(x=silhouette_avg, color="red", linestyle="--")

                ax_sil.set_yticks([])
                ax_sil.set_xticks([-0.1, 0, 0.2, 0.4, 0.6, 0.8, 1])
        axs[5, 1].set_axis_off()

        axs[0, 0].plot(range(1, max), sse)
        axs[0, 0].set_title('Elbow method')
        axs[0, 0].set_xlabel('k')
        axs[0, 0].set_ylabel('Distortion')

        axs[0, 1].plot(used_k, silhouette_scores)
        axs[0, 1].set_ylim([0, 1])
        axs[0, 1].set_xlim([2, max - 1])
        axs[0, 1].set_title('Silhouette method')
        axs[0, 1].set_xlabel('k')
        axs[0, 1].set_ylabel('Silhouette score')
        fig.tight_layout()
        plt.savefig(name + ".png")


def main(path_to_data_folder):
    comparison_folder = os.path.join(path_to_data_folder, "comparisons")
    # create results folder if it does not exist
    if not os.path.exists("results"):
        os.mkdir("results")
    # go through downloaded normalized counts folder
    for folder in os.listdir(comparison_folder):
        if os.path.isdir(os.path.join(comparison_folder, folder)):
            for file in os.listdir(os.path.join(comparison_folder, folder)):
                if file.endswith(".csv"):
                    data = pd.read_csv(os.path.join(comparison_folder, folder, file))
                    data["gene"] = data['gene'] + "_" + data['dataset'].astype(str)
                    data.index = data["gene"]
                    data = data.drop(columns=["dataset", "gene"])

                    # create best k for every method
                    best_k_plots(data, os.path.join("results", file))


if __name__ == "__main__":
    try:
        main(sys.argv[1])
    except:
        print("Usage: python testk.py normalized_data")
        print("You can download the normalized data at http://omicstide-tuevis.cs.uni-tuebingen.de/. Upload your data "
              "and click \"download processed data\".")
