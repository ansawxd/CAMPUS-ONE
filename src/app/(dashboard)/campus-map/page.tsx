export default function CampusMapPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Карта кампуса</h1>
      <p className="text-sm text-neutral-500">Демонстрационная схема. Данные вымышленные.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border rounded p-4">
          <h2 className="font-medium">Корпус 1</h2>
          <p className="text-sm">Аудитории, кафедры</p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-medium">Корпус 3</h2>
          <p className="text-sm">Лекционные залы</p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-medium">Библиотека</h2>
          <p className="text-sm">Читальные залы</p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-medium">Столовая / Спорт / Общежития</h2>
          <p className="text-sm">Поиск аудитории и простые маршруты — в демо-режиме</p>
        </div>
      </div>
    </div>
  );
}
