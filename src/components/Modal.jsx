import { setDoc, uploadFile } from "@junobuild/core";
import { nanoid } from "nanoid";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./Auth";
import { Backdrop } from "./Backdrop";
import { Button } from "./Button";

export const Modal = () => {
  const [showModal, setShowModal] = useState(false);
  const [provinceName, setProvinceName] = useState("");
  const [date, setDate] = useState("");
  const [assistanceType, setAssistanceType] = useState("");
  const [cityName, setCityName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [villageName, setVillageName] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [file, setFile] = useState(undefined);
  const [valid, setValid] = useState(false);
  const [progress, setProgress] = useState(false);
  const uploadElement = useRef(null);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    setValid(
      provinceName !== "" &&
      date !== "" &&
      assistanceType !== "" &&
      cityName !== "" &&
      districtName !== "" &&
      villageName !== "" &&
      transactionAmount !== "" &&
      user !== undefined &&
      user !== null
    );
  }, [
    provinceName,
    date,
    assistanceType,
    cityName,
    districtName,
    villageName,
    transactionAmount,
    user
  ]);

  const reload = () => {
    let event = new Event("reload");
    window.dispatchEvent(event);
  };

  const add = async () => {
    if ([null, undefined].includes(user)) {
      return;
    }

    setProgress(true);

    try {
      let url;

      if (file !== undefined) {
        const filename = `${user.key}-${file.name}`;

        // Upload file and get download URL
        const { downloadUrl } = await uploadFile({
          collection: "bansos", // Menyimpan file di koleksi 'bansos'
          data: file,
          filename,
        });

        url = downloadUrl;
      }

      const key = nanoid();

      await setDoc({
        collection: "bansos",
        doc: {
          key,
          data: {
            provinceName,
            date,
            assistanceType,
            cityName,
            districtName,
            villageName,
            transactionAmount,
            ...(url !== undefined && { url }),
          },
        },
      });

      setShowModal(false);
      reload();
    } catch (err) {
      console.error(err);
    }

    setProgress(false);
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        Add an entry{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20"
          viewBox="0 -960 960 960"
          width="20"
          fill="currentColor"
        >
          <path d="M417-417H166v-126h251v-251h126v251h251v126H543v251H417v-251Z" />
        </svg>
      </Button>

      {showModal ? (
        <>
          <div
            className="fixed inset-0 z-50 p-16 md:px-24 md:py-44 animate-fade"
            role="dialog"
          >
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Nama Provinsi"
                onChange={(e) => setProvinceName(e.target.value)}
                value={provinceName}
                disabled={progress}
              />
              <input
                type="date"
                placeholder="Tanggal"
                onChange={(e) => setDate(e.target.value)}
                value={date}
                disabled={progress}
              />
              <input
                type="text"
                placeholder="Tipe Bansos"
                onChange={(e) => setAssistanceType(e.target.value)}
                value={assistanceType}
                disabled={progress}
              />
              <input
                type="text"
                placeholder="Nama Kota/Kabupaten"
                onChange={(e) => setCityName(e.target.value)}
                value={cityName}
                disabled={progress}
              />
              <input
                type="text"
                placeholder="Nama Kecamatan"
                onChange={(e) => setDistrictName(e.target.value)}
                value={districtName}
                disabled={progress}
              />
              <input
                type="text"
                placeholder="Nama Desa/Kelurahan"
                onChange={(e) => setVillageName(e.target.value)}
                value={villageName}
                disabled={progress}
              />
              <input
                type="text"
                placeholder="Jumlah Dana Transaksi"
                onChange={(e) => setTransactionAmount(e.target.value)}
                value={transactionAmount}
                disabled={progress}
              />
              <input
                ref={uploadElement}
                type="file"
                onChange={(event) => setFile(event.target.files?.[0])}
                disabled={progress}
              />
              <div role="toolbar" className="flex justify-between items-center">
                {progress ? (
                  <div
                    className="my-8 animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-indigo-600 rounded-full"
                    role="status"
                    aria-label="loading"
                  >
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  <div className="flex my-4">
                    <button
                      className="py-1 px-8 hover:text-lavender-blue-600 active:text-lavender-blue-400"
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>

                    <Button onClick={add} disabled={!valid}>
                      Submit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Backdrop />
        </>
      ) : null}
    </>
  );
};
